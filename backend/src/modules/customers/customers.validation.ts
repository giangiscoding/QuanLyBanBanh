import { z } from 'zod';

const customerBody = z.object({
  fullName: z.string().min(1, 'Thieu ten khach hang'),
  phone: z.string().min(9, 'So dien thoai khong hop le').optional().nullable(),
  email: z.string().email('Email khong hop le').optional().nullable(),
  address: z.string().optional().nullable(),
  points: z.number().int().nonnegative().optional(),
});

export const createCustomerSchema = z.object({ body: customerBody });

export const updateCustomerSchema = z.object({ body: customerBody.partial() });

export type CreateCustomerInput = z.infer<typeof customerBody>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;
