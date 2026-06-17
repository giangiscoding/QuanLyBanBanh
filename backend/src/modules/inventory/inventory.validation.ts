import { z } from 'zod';

// Kiem ke / dieu chinh ton kho: nhap so luong THUC TE dem duoc,
// he thong tu tinh chenh lech so voi ton hien tai roi ghi nhan stock movement.
const adjustBody = z.object({
  productId: z.number().int().positive('Thieu san pham'),
  actualQuantity: z.number().int().nonnegative('So luong thuc te khong hop le'),
  note: z.string().optional(),
});

export const adjustStockSchema = z.object({ body: adjustBody });

export type AdjustStockInput = z.infer<typeof adjustBody>;