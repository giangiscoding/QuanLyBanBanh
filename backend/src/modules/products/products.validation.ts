import { z } from 'zod';

// Cac field cua san pham. Field optional se dung gia tri mac dinh trong DB (Prisma @default).
const productBody = z.object({
  sku: z.string().min(1, 'Thieu ma SKU'),
  name: z.string().min(1, 'Thieu ten san pham'),
  categoryId: z.number().int().positive().optional(),
  salePrice: z.number().nonnegative('Gia ban khong hop le'),
  costPrice: z.number().nonnegative('Gia von khong hop le').optional(),
  minStock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url('URL anh khong hop le').optional(),
  isActive: z.boolean().optional(),
});

export const createProductSchema = z.object({ body: productBody });

// Update: tat ca field deu optional, khong ap dat mac dinh
export const updateProductSchema = z.object({ body: productBody.partial() });

export type CreateProductInput = z.infer<typeof productBody>;
export type UpdateProductInput = Partial<CreateProductInput>;
