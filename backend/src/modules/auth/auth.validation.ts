import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Ten dang nhap toi thieu 3 ky tu'),
    password: z.string().min(6, 'Mat khau toi thieu 6 ky tu'),
    email: z.string().email('Email khong hop le').optional(),
    role: z.nativeEnum(Role).optional(),
    fullName: z.string().min(1, 'Thieu ho ten').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Thieu ten dang nhap'),
    password: z.string().min(1, 'Thieu mat khau'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
