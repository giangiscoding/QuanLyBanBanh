import { z } from 'zod';

const supplierBody = z.object({
  name: z.string().min(1, 'Thieu ten nha cung cap'),
  phone: z.string().min(9, 'So dien thoai khong hop le').optional().nullable(),
  email: z.string().email('Email khong hop le').optional().nullable(),
  address: z.string().optional().nullable(),
});

export const createSupplierSchema = z.object({ body: supplierBody });

export const updateSupplierSchema = z.object({ body: supplierBody.partial() });

export type CreateSupplierInput = z.infer<typeof supplierBody>;
export type UpdateSupplierInput = Partial<CreateSupplierInput>;
