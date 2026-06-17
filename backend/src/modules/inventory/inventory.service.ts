import { Prisma, StockMovementType } from '@prisma/client';
import { prisma } from '../../config/db';
import { NotFoundError } from '../../common/errors/AppError';

// 📌 Phu trach: NGUOI 2 (Luong Cung ung - Kho)
//
// ⚠️ DAY LA SERVICE DUNG CHUNG (interface chia se).
// - Nhap hang (Nguoi 2) goi: stockMovement({ type: 'IN', ... })
// - Ban hang  (Nguoi 3) goi: stockMovement({ type: 'OUT', ... })
// Cac module khac KHONG tu sua bang products.stock_quantity hay stock_movements,
// ma PHAI goi qua ham nay de dam bao ton kho luon nhat quan.

interface StockMovementInput {
  productId: number;
  quantity: number; // luon la so duong (so luong thay doi)
  type: StockMovementType; // IN | OUT | ADJUST
  referenceType?: string; // 'ORDER' | 'PURCHASE' | 'ADJUST'
  referenceId?: number;
  note?: string;
}

export const inventoryService = {
  /**
   * Ghi nhan bien dong kho + cap nhat ton kho san pham trong 1 transaction.
   * Co the truyen 'tx' neu goi tu mot transaction lon hon (vd: tao don hang).
   */
  async stockMovement(input: StockMovementInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    const delta = input.type === StockMovementType.OUT ? -input.quantity : input.quantity;

    const run = async (c: Prisma.TransactionClient) => {
      await c.stockMovement.create({
        data: {
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          note: input.note,
        },
      });
      return c.product.update({
        where: { id: input.productId },
        data: { stockQuantity: { increment: delta } },
      });
    };

    if (tx) return run(tx);
    return prisma.$transaction(run);
  },

  // Danh sach san pham sap het hang (ton <= nguong toi thieu)
  async lowStock() {
    const products = await prisma.product.findMany({ where: { isActive: true } });
    return products.filter((p) => p.stockQuantity <= p.minStock);
  },

  // Lich su xuat/nhap kho, co the loc theo san pham
  async history(params: { page?: number; limit?: number; productId?: number }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = params.productId ? { productId: params.productId } : {};

    const [items, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { id: true, sku: true, name: true } } },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  // Dieu chinh / kiem ke: dat ton kho ve so luong dem duoc thuc te.
  // Ghi nhan chenh lech qua mot bien dong loai ADJUST.
  async adjust(input: { productId: number; countedQuantity: number; note?: string }) {
    const product = await prisma.product.findUnique({ where: { id: input.productId } });
    if (!product) throw new NotFoundError('Khong tim thay san pham');

    const delta = input.countedQuantity - product.stockQuantity;

    return prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: {
          productId: input.productId,
          type: StockMovementType.ADJUST,
          quantity: Math.abs(delta),
          referenceType: 'ADJUST',
          note: input.note ?? `Kiem ke: ${product.stockQuantity} -> ${input.countedQuantity}`,
        },
      });
      return tx.product.update({
        where: { id: input.productId },
        data: { stockQuantity: input.countedQuantity },
      });
    });
  },
};
