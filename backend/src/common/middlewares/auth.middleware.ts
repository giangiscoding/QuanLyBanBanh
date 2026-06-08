import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

export interface JwtPayload {
  userId: number;
  username: string;
  role: Role;
}

// Gan thong tin user vao request sau khi xac thuc
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Kiem tra token, bat buoc dang nhap
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Thieu token xac thuc');
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Token khong hop le hoac da het han');
  }
}

// Phan quyen theo vai tro - dung sau authenticate
// vd: authorize('ADMIN', 'MANAGER')
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new ForbiddenError('Ban khong co quyen thuc hien thao tac nay');
    }
    next();
  };
}
