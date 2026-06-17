import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { purchasingService } from './purchasing.service';

export const purchasingController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, supplierId } = req.query;
    const result = await purchasingService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      supplierId: supplierId ? Number(supplierId) : undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const po = await purchasingService.getById(Number(req.params.id));
    sendSuccess(res, { data: po });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const po = await purchasingService.create(req.body, req.user!.userId);
    sendSuccess(res, { data: po, message: 'Tao phieu nhap thanh cong', statusCode: 201 });
  }),
};
