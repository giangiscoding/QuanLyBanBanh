import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError } from '../../common/errors/AppError';
import type { JwtPayload } from '../../common/middlewares/auth.middleware';
import type { LoginInput, RegisterInput } from './auth.validation';

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { username: input.username } });
    if (existing) {
      throw new ConflictError('Ten dang nhap da ton tai');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash,
        role: input.role ?? Role.STAFF,
        // Tao luon ho so nhan vien neu co ten
        ...(input.fullName
          ? { employee: { create: { fullName: input.fullName } } }
          : {}),
      },
      select: { id: true, username: true, email: true, role: true },
    });

    return user;
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { username: input.username } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Sai ten dang nhap hoac mat khau');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Sai ten dang nhap hoac mat khau');
    }

    const token = signToken({ userId: user.id, username: user.username, role: user.role });

    return {
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  },

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        employee: { select: { id: true, fullName: true, position: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedError();
    }
    return user;
  },
};
