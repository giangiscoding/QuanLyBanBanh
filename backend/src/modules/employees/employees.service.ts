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
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
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
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : input.dateOfBirth,
    };
    return prisma.employee.update({
      where: { id },
      data,
      include: { user: { select: { id: true, username: true, role: true } } },
    });
  },

  async remove(id: number) {
    await this.getById(id);
    // Khong xoa han - chuyen sang "da nghi viec" de van luu ho so + lich su don/cham cong
    return prisma.employee.update({
      where: { id },
      data: { status: 'INACTIVE' },
      include: { user: { select: { id: true, username: true, role: true } } },
    });
  },

  // Thong tin chi tiet: cham cong (so cong) + hieu suat (don phu trach) + danh gia
  async getDetail(id: number) {
    const employee = await this.getById(id);

    const now = new Date();
    const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startQuarter = new Date(Date.UTC(now.getUTCFullYear(), Math.floor(now.getUTCMonth() / 3) * 3, 1));
    const startYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

    // --- Cham cong ---
    const yearAtt = await prisma.attendance.findMany({
      where: { employeeId: id, workDate: { gte: startYear } },
      select: { workDate: true, status: true },
    });
    const congValue = (s: string) => (s === 'PRESENT' ? 1 : s === 'HALF_DAY' ? 0.5 : 0);
    const sumCong = (from: Date) =>
      yearAtt.filter((a) => a.workDate >= from).reduce((sum, a) => sum + congValue(a.status), 0);

    const monthAtt = yearAtt.filter((a) => a.workDate >= startMonth);
    const breakdownThisMonth = {
      present: monthAtt.filter((a) => a.status === 'PRESENT').length,
      halfDay: monthAtt.filter((a) => a.status === 'HALF_DAY').length,
      leave: monthAtt.filter((a) => a.status === 'LEAVE').length,
      absent: monthAtt.filter((a) => a.status === 'ABSENT').length,
    };

    const attendance = {
      month: sumCong(startMonth),
      quarter: sumCong(startQuarter),
      year: sumCong(startYear),
      breakdownThisMonth,
    };

    // --- Hieu suat: don hang da xu ly (COMPLETED) ---
    const perfFor = async (from: Date) => {
      const agg = await prisma.order.aggregate({
        where: { employeeId: id, status: 'COMPLETED', createdAt: { gte: from } },
        _sum: { finalAmount: true },
        _count: true,
      });
      return { orders: agg._count, revenue: Number(agg._sum.finalAmount ?? 0) };
    };
    const performance = {
      month: await perfFor(startMonth),
      quarter: await perfFor(startQuarter),
      year: await perfFor(startYear),
    };

    // --- Danh gia (dua tren so cong thang nay) ---
    const m = attendance.month;
    const rating =
      m >= 24 ? 'Xuat sac' : m >= 20 ? 'Tot' : m >= 14 ? 'Kha' : 'Can cai thien';

    return { employee, attendance, performance, rating };
  },
};
