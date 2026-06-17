import { prisma } from '../../config/db';
import { AppError, ConflictError, NotFoundError } from '../../common/errors/AppError';
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.validation';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const categoriesService = {
  async list(params: ListParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = params.search
      ? { name: { contains: params.search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      prisma.category.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundError('Khong tim thay danh muc');
    return category;
  },

  async create(input: CreateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { name: input.name } });
    if (existing) throw new ConflictError('Ten danh muc da ton tai');
    return prisma.category.create({ data: input });
  },

  async update(id: number, input: UpdateCategoryInput) {
    await this.getById(id);
    if (input.name) {
      const existing = await prisma.category.findUnique({ where: { name: input.name } });
      if (existing && existing.id !== id) throw new ConflictError('Ten danh muc da ton tai');
    }
    return prisma.category.update({ where: { id }, data: input });
  },

  async remove(id: number) {
    const category = await this.getById(id);
    if (category._count.products > 0) {
      throw new AppError('Khong the xoa danh muc dang co san pham');
    }
    return prisma.category.delete({ where: { id } });
  },
};
