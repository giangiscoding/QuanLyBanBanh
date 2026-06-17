import { PaymentMethod, OrderStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { inventoryService } from '../inventory/inventory.service';
import { AppError, NotFoundError } from '../../common/errors/AppError';
import type { CreateOrderInput } from './sales.validation';

interface ListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customerId?: number;
}

async function generateOrderCode(): Promise<string> {
  const last = await prisma.order.findFirst({ orderBy: { id: 'desc' } });
  const nextNum = (last?.id ?? 0) + 1;
  return `HD${String(nextNum).padStart(4, '0')}`;
}

export const salesService = {
  async list(params: ListParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.customerId ? { customerId: params.customerId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          employee: { select: { id: true, fullName: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        employee: { select: { id: true, fullName: true } },
        items: {
          include: {
            product: { select: { id: true, sku: true, name: true } },
          },
        },
      },
    });
    if (!order) throw new NotFoundError('Khong tim thay don hang');
    return order;
  },

  async create(input: CreateOrderInput, userId: number) {
    // Lay employee tu user dang nhap
    const employee = await prisma.employee.findUnique({ where: { userId } });

    // Kiem tra san pham ton tai, dang ban va du ton kho
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      throw new AppError('Co san pham khong ton tai hoac da ngung kinh doanh');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of input.items) {
      const product = productMap.get(item.productId)!;
      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          `San pham "${product.name}" khong du ton kho (con ${product.stockQuantity})`,
        );
      }
    }

    // Tinh tien
    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.salePrice);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal: unitPrice * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
    const discount = input.discount ?? 0;
    const finalAmount = Math.max(0, totalAmount - discount);
    const code = await generateOrderCode();

    // Tao don hang + items + tru kho trong 1 transaction
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          code,
          customerId: input.customerId ?? null,
          employeeId: employee?.id ?? null,
          totalAmount,
          discount,
          finalAmount,
          paymentMethod: input.paymentMethod as PaymentMethod,
          status: OrderStatus.COMPLETED,
          note: input.note ?? null,
          items: {
            create: orderItems,
          },
        },
        include: {
          customer: { select: { id: true, fullName: true } },
          employee: { select: { id: true, fullName: true } },
          items: {
            include: { product: { select: { id: true, sku: true, name: true } } },
          },
        },
      });

      // Tru ton kho cho tung san pham
      for (const item of orderItems) {
        await inventoryService.stockMovement(
          {
            productId: item.productId,
            quantity: item.quantity,
            type: 'OUT',
            referenceType: 'ORDER',
            referenceId: created.id,
            note: `Ban theo don ${code}`,
          },
          tx,
        );
      }

      return created;
    });

    return order;
  },

  async cancel(id: number) {
    const order = await this.getById(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new AppError('Don hang nay da bi huy truoc do');
    }

    return prisma.$transaction(async (tx) => {
      // Hoan tra ton kho
      for (const item of order.items) {
        await inventoryService.stockMovement(
          {
            productId: item.productId,
            quantity: item.quantity,
            type: 'IN',
            referenceType: 'ORDER',
            referenceId: order.id,
            note: `Hoan kho do huy don ${order.code}`,
          },
          tx,
        );
      }

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });
    });
  },
};
