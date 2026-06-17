import { prisma } from '../../config/db';
import { NotFoundError } from '../../common/errors/AppError';
import type { CreateSupplierInput, UpdateSupplierInput } from './suppliers.validation';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const suppliersService = {
  async list(params: ListParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' as const } },
            { phone: { contains: params.search, mode: 'insensitive' as const } },
            { email: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplier.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });
    if (!supplier) throw new NotFoundError('Khong tim thay nha cung cap');
    return supplier;
  },

  async create(input: CreateSupplierInput) {
    return prisma.supplier.create({ data: input }); // [cite: 21]
  },

  async update(id: number, input: UpdateSupplierInput) {
    await this.getById(id);
    return prisma.supplier.update({ where: { id }, data: input }); // [cite: 23]
  },

  async remove(id: number) {
    await this.getById(id);
    // Thay đổi: Do database không có cột isActive, ta thực hiện xóa vĩnh viễn (delete) 
    return prisma.supplier.delete({ where: { id } }); 
  },
};