import { z } from 'zod';

const purchaseItemInput = z.object({
  productId: z.number().int().positive('productId khong hop le'),
  quantity: z.number().int().positive('So luong phai lon hon 0'),
  unitCost: z.number().nonnegative('Gia nhap khong hop le'),
});

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.number().int().positive().optional().nullable(),
    note: z.string().optional().nullable(),
    items: z.array(purchaseItemInput).min(1, 'Phieu nhap phai co it nhat 1 san pham'),
  }),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>['body'];
