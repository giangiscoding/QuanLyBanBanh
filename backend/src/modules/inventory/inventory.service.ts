import { Prisma, StockMovementType } from '@prisma/client';
import { prisma } from '../../config/db';
import { NotFoundError } from '../../common/errors/AppError';
import type { AdjustStockInput } from './inventory.validation';

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

interface HistoryParams {
  productId?: number;
  type?: StockMovementType;
  page?: number;
  limit?: number;
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

  // Lich su xuat/nhap kho - co the loc theo san pham va/hoac loai bien dong
  async history(params: HistoryParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(params.productId ? { productId: params.productId } : {}),
      ...(params.type ? { type: params.type } : {}),
    };

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

  // Kiem ke / dieu chinh ton kho: so sanh so luong thuc te voi he thong,
  // tu suy ra IN hay OUT, danh dau referenceType: 'ADJUST'.
  async adjust(input: AdjustStockInput) {
    const product = await prisma.product.findUnique({ where: { id: input.productId } });
    if (!product) throw new NotFoundError('Khong tim thay san pham');

    const diff = input.actualQuantity - product.stockQuantity;

    if (diff === 0) {
      return { adjusted: false, message: 'Ton kho da khop, khong can dieu chinh', product };
    }

    const type = diff > 0 ? StockMovementType.IN : StockMovementType.OUT;
    const quantity = Math.abs(diff);

    const updatedProduct = await this.stockMovement({
      productId: input.productId,
      quantity,
      type,
      referenceType: 'ADJUST',
      note: input.note ?? `Dieu chinh kiem ke: ${product.stockQuantity} -> ${input.actualQuantity}`,
    });

    return { adjusted: true, delta: diff, product: updatedProduct };
  },
};
