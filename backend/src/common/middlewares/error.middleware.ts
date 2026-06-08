import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { sendError } from '../utils/response';

// Middleware xu ly loi tap trung - dat o cuoi cung cua app
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Loi nghiep vu da biet
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Loi validation tu Zod
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    sendError(res, message, 422);
    return;
  }

  // Loi rang buoc unique tu Prisma (vd: trung username)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 'Du lieu da ton tai (trung gia tri duy nhat)', 409);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Khong tim thay du lieu', 404);
      return;
    }
  }

  // Loi khong doan truoc
  console.error('❌ Loi he thong:', err);
  sendError(res, 'Loi may chu noi bo', 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Khong tim thay route: ${req.method} ${req.originalUrl}`, 404);
}
