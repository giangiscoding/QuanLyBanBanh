import { prisma } from '../../config/db';
import { NotFoundError } from '../../common/errors/AppError';
import type { CreateProductInput, UpdateProductInput } from './products.validation';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

export const productsService = {
  async list(params: ListParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' as const } },
              { sku: { contains: params.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundError('Khong tim thay san pham');
    return product;
  },

  async create(input: CreateProductInput) {
    return prisma.product.create({ data: input });
  },

  async update(id: number, input: UpdateProductInput) {
    await this.getById(id);
    return prisma.product.update({ where: { id }, data: input });
  },

  async remove(id: number) {
    await this.getById(id);
    // Khong xoa han - chi an di de giu lich su don hang
    return prisma.product.update({ where: { id }, data: { isActive: false } });
  },
};
