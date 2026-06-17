import { z } from 'zod';

const orderItemInput = z.object({
  productId: z.number().int().positive('productId khong hop le'),
  quantity: z.number().int().positive('So luong phai lon hon 0'),
});

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive().optional().nullable(),
    discount: z.number().nonnegative('Giam gia khong hop le').optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']),
    note: z.string().optional().nullable(),
    items: z.array(orderItemInput).min(1, 'Don hang phai co it nhat 1 san pham'),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
