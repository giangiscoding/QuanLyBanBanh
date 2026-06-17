import { prisma } from '../../config/db';
import { ConflictError, NotFoundError } from '../../common/errors/AppError';
import type { CreateEmployeeInput, UpdateEmployeeInput } from './employees.validation';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const employeesService = {
  async list(params: ListParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = params.search
      ? {
          OR: [
            { fullName: { contains: params.search, mode: 'insensitive' as const } },
            { position: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, username: true, role: true } } },
      }),
      prisma.employee.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: number) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: { select: { id: true, username: true, role: true, email: true } } },
    });
    if (!employee) throw new NotFoundError('Khong tim thay nhan vien');
    return employee;
  },

  async create(input: CreateEmployeeInput) {
    if (input.userId) {
      const existing = await prisma.employee.findUnique({ where: { userId: input.userId } });
      if (existing) throw new ConflictError('Tai khoan nay da lien ket voi nhan vien khac');
    }
    const data = {
      ...input,
      hiredAt: input.hiredAt ? new Date(input.hiredAt) : undefined,
    };
    return prisma.employee.create({
      data,
      include: { user: { select: { id: true, username: true, role: true } } },
    });
  },

  async update(id: number, input: UpdateEmployeeInput) {
    await this.getById(id);
    if (input.userId) {
      const existing = await prisma.employee.findUnique({ where: { userId: input.userId } });
      if (existing && existing.id !== id) throw new ConflictError('Tai khoan nay da lien ket voi nhan vien khac');
    }
    const data = {
      ...input,
      hiredAt: input.hiredAt ? new Date(input.hiredAt) : input.hiredAt,
    };
    return prisma.employee.update({
      where: { id },
      data,
      include: { user: { select: { id: true, username: true, role: true } } },
    });
  },

  async remove(id: number) {
    await this.getById(id);
    return prisma.employee.delete({ where: { id } });
  },
};
