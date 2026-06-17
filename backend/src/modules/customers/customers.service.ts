import { prisma } from '../../config/db';
import { ConflictError, NotFoundError } from '../../common/errors/AppError';
import type { CreateCustomerInput, UpdateCustomerInput } from './customers.validation';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const customersService = {
  async list(params: ListParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = params.search
      ? {
          OR: [
            { fullName: { contains: params.search, mode: 'insensitive' as const } },
            { phone: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: number) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundError('Khong tim thay khach hang');
    return customer;
  },

  async create(input: CreateCustomerInput) {
    if (input.phone) {
      const existing = await prisma.customer.findUnique({ where: { phone: input.phone } });
      if (existing) throw new ConflictError('So dien thoai da duoc dang ky');
    }
    return prisma.customer.create({ data: input });
  },

  async update(id: number, input: UpdateCustomerInput) {
    await this.getById(id);
    if (input.phone) {
      const existing = await prisma.customer.findUnique({ where: { phone: input.phone } });
      if (existing && existing.id !== id) throw new ConflictError('So dien thoai da duoc dang ky');
    }
    return prisma.customer.update({ where: { id }, data: input });
  },

  async remove(id: number) {
    await this.getById(id);
    return prisma.customer.delete({ where: { id } });
  },
};
