import { z } from 'zod';

export const adjustStockSchema = z.object({
  body: z.object({
    productId: z.number().int().positive('productId khong hop le'),
    countedQuantity: z.number().int().nonnegative('So luong kiem ke khong hop le'),
    note: z.string().optional().nullable(),
  }),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>['body'];
