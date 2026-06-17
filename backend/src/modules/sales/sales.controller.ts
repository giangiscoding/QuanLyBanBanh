import { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { salesService } from './sales.service';

export const salesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, customerId } = req.query;
    const result = await salesService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as OrderStatus | undefined,
      customerId: customerId ? Number(customerId) : undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const order = await salesService.getById(Number(req.params.id));
    sendSuccess(res, { data: order });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await salesService.create(req.body, req.user!.userId);
    sendSuccess(res, { data: order, message: 'Tao don hang thanh cong', statusCode: 201 });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    await salesService.cancel(Number(req.params.id));
    sendSuccess(res, { message: 'Da huy don hang' });
  }),
};
