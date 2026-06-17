import { z } from 'zod';

const employeeBody = z.object({
  fullName: z.string().min(1, 'Thieu ten nhan vien'),
  phone: z.string().min(9, 'So dien thoai khong hop le').optional().nullable(),
  address: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  salary: z.number().nonnegative('Luong khong hop le').optional().nullable(),
  hiredAt: z.string().datetime({ offset: true }).optional().nullable(),
  userId: z.number().int().positive().optional().nullable(),
});

export const createEmployeeSchema = z.object({ body: employeeBody });

export const updateEmployeeSchema = z.object({ body: employeeBody.partial() });

export type CreateEmployeeInput = z.infer<typeof employeeBody>;
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;
