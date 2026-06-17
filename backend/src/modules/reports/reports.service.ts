import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/db';

interface RangeParams {
  from?: Date;
  to?: Date;
}

function buildDateFilter(params: RangeParams) {
  const range: Prisma.DateTimeFilter = {};
  if (params.from) range.gte = params.from;
  if (params.to) range.lte = params.to;
  return Object.keys(range).length ? range : undefined;
}

export const reportsService = {
  // Tong quan doanh thu + loi nhuan trong khoang thoi gian
  async revenue(params: RangeParams) {
    const createdAt = buildDateFilter(params);
    const where: Prisma.OrderWhereInput = {
      status: OrderStatus.COMPLETED,
      ...(createdAt ? { createdAt } : {}),
    };

    const agg = await prisma.order.aggregate({
      where,
      _sum: { totalAmount: true, discount: true, finalAmount: true },
      _count: true,
    });

    // Gia von hang ban (COGS) = tong (so luong * gia von) cua cac don da hoan thanh
    const items = await prisma.orderItem.findMany({
      where: { order: where },
      include: { product: { select: { costPrice: true } } },
    });
    const cogs = items.reduce((sum, i) => sum + i.quantity * Number(i.product.costPrice), 0);

    const revenue = Number(agg._sum.finalAmount ?? 0);

    return {
      orderCount: agg._count,
      totalAmount: Number(agg._sum.totalAmount ?? 0),
      discount: Number(agg._sum.discount ?? 0),
      revenue,
      cogs,
      profit: revenue - cogs,
    };
  },

  // Doanh thu theo tung ngay (cho bieu do)
  async revenueByDay(params: RangeParams) {
    const conditions: Prisma.Sql[] = [Prisma.sql`status = 'COMPLETED'`];
    if (params.from) conditions.push(Prisma.sql`created_at >= ${params.from}`);
    if (params.to) conditions.push(Prisma.sql`created_at <= ${params.to}`);
    const whereSql = Prisma.join(conditions, ' AND ');

    const rows = await prisma.$queryRaw<Array<{ day: Date; revenue: number; orders: bigint }>>(
      Prisma.sql`
        SELECT date_trunc('day', created_at) AS day,
               SUM(final_amount)::float8 AS revenue,
               COUNT(*) AS orders
        FROM orders
        WHERE ${whereSql}
        GROUP BY day
        ORDER BY day ASC
      `,
    );

    return rows.map((r) => ({
      day: r.day,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));
  },

  // Top san pham ban chay
  async topProducts(params: RangeParams & { limit?: number }) {
    const createdAt = buildDateFilter(params);
    const limit = params.limit ?? 10;

    const grouped = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { status: OrderStatus.COMPLETED, ...(createdAt ? { createdAt } : {}) },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productIds = grouped.map((g) => g.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, sku: true, name: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return grouped.map((g) => ({
      product: productMap.get(g.productId) ?? null,
      quantitySold: g._sum.quantity ?? 0,
      revenue: Number(g._sum.subtotal ?? 0),
    }));
  },

  // Bao cao ton kho: gia tri ton, so san pham sap het
  async inventory() {
    const products = await prisma.product.findMany({ where: { isActive: true } });

    let stockValue = 0;
    let retailValue = 0;
    const lowStock = [] as Array<{ id: number; sku: string; name: string; stockQuantity: number; minStock: number }>;

    for (const p of products) {
      stockValue += p.stockQuantity * Number(p.costPrice);
      retailValue += p.stockQuantity * Number(p.salePrice);
      if (p.stockQuantity <= p.minStock) {
        lowStock.push({
          id: p.id,
          sku: p.sku,
          name: p.name,
          stockQuantity: p.stockQuantity,
          minStock: p.minStock,
        });
      }
    }

    return {
      totalProducts: products.length,
      stockValue,
      retailValue,
      lowStockCount: lowStock.length,
      lowStock,
    };
  },
};
