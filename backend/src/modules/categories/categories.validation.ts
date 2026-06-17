import { z } from 'zod';

const categoryBody = z.object({
  name: z.string().min(1, 'Thieu ten danh muc'),
  description: z.string().optional().nullable(),
});

export const createCategorySchema = z.object({ body: categoryBody });

export const updateCategorySchema = z.object({ body: categoryBody.partial() });

export type CreateCategoryInput = z.infer<typeof categoryBody>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
