import { z } from 'zod';

const supplierBody = z.object({
  name: z.string().min(1, 'Thieu ten nha cung cap'),
  email: z.string().email('Email khong hop le').optional().or(z.literal('')),
  phone: z.string().min(10, 'So dien thoai khong hop le').optional().or(z.literal('')),
  address: z.string().optional(),
  taxCode: z.string().optional(),
 
});

export const createSupplierSchema = z.object({ body: supplierBody });
export const updateSupplierSchema = z.object({ body: supplierBody.partial() });

export type CreateSupplierInput = z.infer<typeof supplierBody>;
export type UpdateSupplierInput = Partial<CreateSupplierInput>;