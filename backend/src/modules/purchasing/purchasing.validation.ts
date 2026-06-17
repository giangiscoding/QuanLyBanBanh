import { z } from 'zod';
import { PurchaseStatus } from '@prisma/client';

// 1 dong san pham trong phieu nhap
const purchaseItemSchema = z.object({
  productId: z.number().int().positive('Thieu san pham'),
  quantity: z.number().int().positive('So luong phai lon hon 0'),
  unitCost: z.number().nonnegative('Gia nhap khong hop le'),
});

const createPurchaseOrderBody = z.object({
  supplierId: z.number().int().positive().optional(),
  employeeId: z.number().int().positive().optional(),
  // Mac dinh RECEIVED (xem schema.prisma) - hang ve kho ngay.
  // Truyen PENDING neu chua nhan hang, xac nhan sau bang API /:id/receive
  status: z.nativeEnum(PurchaseStatus).optional(),
  note: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'Phieu nhap phai co it nhat 1 san pham'),
});

export const createPurchaseOrderSchema = z.object({ body: createPurchaseOrderBody });

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderBody>;