import { Request, Response } from 'express';
import { PurchaseStatus } from '@prisma/client';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { purchasingService } from './purchasing.service';

export const purchasingController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, supplierId, status } = req.query;
    const result = await purchasingService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      supplierId: supplierId ? Number(supplierId) : undefined,
      status: status as PurchaseStatus | undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const order = await purchasingService.getById(Number(req.params.id));
    sendSuccess(res, { data: order });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await purchasingService.create(req.body);
    sendSuccess(res, { data: order, message: 'Tao phieu nhap thanh cong', statusCode: 201 });
  }),

  receive: asyncHandler(async (req: Request, res: Response) => {
    const order = await purchasingService.receive(Number(req.params.id));
    sendSuccess(res, { data: order, message: 'Da xac nhan nhap hang, cong ton kho thanh cong' });
  }),
};