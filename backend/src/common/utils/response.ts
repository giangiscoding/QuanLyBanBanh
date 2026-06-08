import { Response } from 'express';

// Format response chuan cho toan he thong
// { success, data, message } - thong nhat cho ca nhom

interface SuccessOptions {
  data?: unknown;
  message?: string;
  statusCode?: number;
  meta?: unknown; // dung cho phan trang
}

export function sendSuccess(res: Response, options: SuccessOptions = {}): Response {
  const { data = null, message = 'Thanh cong', statusCode = 200, meta } = options;
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta !== undefined ? { meta } : {}),
  });
}

export function sendError(res: Response, message: string, statusCode = 400): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
}
