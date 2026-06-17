import { PurchaseStatus, StockMovementType } from '@prisma/client';
import { prisma } from '../../config/db';
import { NotFoundError, AppError } from '../../common/errors/AppError';
import { inventoryService } from '../inventory/inventory.service';
import type { CreatePurchaseOrderInput } from './purchasing.validation';

// 📌 Phu trach: NGUOI 2 (Luong Cung ung - Kho)
//
// Khi phieu nhap o trang thai RECEIVED (mac dinh), PHAI cong ton kho ngay
// bang cach goi inventoryService.stockMovement({ type: 'IN', ... }).
// Tat ca duoc boc trong 1 transaction de dam bao toan ven du lieu.

interface ListParams {
  page?: number;
  limit?: number;
  supplierId?: number;
  status?: PurchaseStatus;
}

function generateCode(): string {
  return `PN${Date.now()}`;
}

export const purchasingService = {
  async list(params: ListParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(params.supplierId ? { supplierId: params.supplierId } : {}),
      ...(params.status ? { status: params.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { supplier: { select: { id: true, name: true } } },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: number) {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        employee: { select: { id: true, fullName: true } },
        items: { include: { product: { select: { id: true, sku: true, name: true } } } },
      },
    });
    if (!order) throw new NotFoundError('Khong tim thay phieu nhap');
    return order;
  },

  async create(input: CreatePurchaseOrderInput) {
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const status = input.status ?? PurchaseStatus.RECEIVED;

    return prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
          code: generateCode(),
          supplierId: input.supplierId,
          employeeId: input.employeeId,
          totalAmount,
          status,
          note: input.note,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              subtotal: item.quantity * item.unitCost,
            })),
          },
        },
        include: { items: true },
      });

      // Da nhan hang ngay luc tao -> cong ton kho cho tung dong san pham
      if (status === PurchaseStatus.RECEIVED) {
        for (const item of order.items) {
          await inventoryService.stockMovement(
            {
              productId: item.productId,
              quantity: item.quantity,
              type: StockMovementType.IN,
              referenceType: 'PURCHASE',
              referenceId: order.id,
            },
            tx,
          );
        }
      }

      return order;
    });
  },

  // Xac nhan da nhan hang cho 1 phieu dang PENDING -> cong ton kho luc nay
  async receive(id: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
      if (!order) throw new NotFoundError('Khong tim thay phieu nhap');
      if (order.status !== PurchaseStatus.PENDING) {
        throw new AppError('Phieu nhap nay da duoc xu ly truoc do, khong the nhan lai', 409);
      }

      for (const item of order.items) {
        await inventoryService.stockMovement(
          {
            productId: item.productId,
            quantity: item.quantity,
            type: StockMovementType.IN,
            referenceType: 'PURCHASE',
            referenceId: order.id,
          },
          tx,
        );
      }

      return tx.purchaseOrder.update({ where: { id }, data: { status: PurchaseStatus.RECEIVED } });
    });
  },
};