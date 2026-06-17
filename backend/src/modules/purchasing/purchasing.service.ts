import { PurchaseStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { inventoryService } from '../inventory/inventory.service';
import { AppError, NotFoundError } from '../../common/errors/AppError';
import type { CreatePurchaseInput } from './purchasing.validation';

interface ListParams {
  page?: number;
  limit?: number;
  supplierId?: number;
}

async function generatePurchaseCode(): Promise<string> {
  const last = await prisma.purchaseOrder.findFirst({ orderBy: { id: 'desc' } });
  const nextNum = (last?.id ?? 0) + 1;
  return `PN${String(nextNum).padStart(4, '0')}`;
}

export const purchasingService = {
  async list(params: ListParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = params.supplierId ? { supplierId: params.supplierId } : {};

    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          employee: { select: { id: true, fullName: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: number) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, phone: true } },
        employee: { select: { id: true, fullName: true } },
        items: {
          include: { product: { select: { id: true, sku: true, name: true } } },
        },
      },
    });
    if (!po) throw new NotFoundError('Khong tim thay phieu nhap');
    return po;
  },

  async create(input: CreatePurchaseInput, userId: number) {
    const employee = await prisma.employee.findUnique({ where: { userId } });

    // Kiem tra san pham ton tai
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== new Set(productIds).size) {
      throw new AppError('Co san pham khong ton tai');
    }

    const purchaseItems = input.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      subtotal: item.unitCost * item.quantity,
    }));

    const totalAmount = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);
    const code = await generatePurchaseCode();

    // Tao phieu nhap + items + cong ton kho trong 1 transaction
    return prisma.$transaction(async (tx) => {
      const created = await tx.purchaseOrder.create({
        data: {
          code,
          supplierId: input.supplierId ?? null,
          employeeId: employee?.id ?? null,
          totalAmount,
          status: PurchaseStatus.RECEIVED,
          note: input.note ?? null,
          items: { create: purchaseItems },
        },
        include: {
          supplier: { select: { id: true, name: true } },
          employee: { select: { id: true, fullName: true } },
          items: {
            include: { product: { select: { id: true, sku: true, name: true } } },
          },
        },
      });

      // Cong ton kho cho tung san pham
      for (const item of purchaseItems) {
        await inventoryService.stockMovement(
          {
            productId: item.productId,
            quantity: item.quantity,
            type: 'IN',
            referenceType: 'PURCHASE',
            referenceId: created.id,
            note: `Nhap theo phieu ${code}`,
          },
          tx,
        );
      }

      return created;
    });
  },
};
