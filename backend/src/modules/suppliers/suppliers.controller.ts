import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { suppliersService } from './suppliers.service';

export const suppliersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search } = req.query;
    const result = await suppliersService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const supplier = await suppliersService.getById(Number(req.params.id));
    sendSuccess(res, { data: supplier });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const supplier = await suppliersService.create(req.body);
    sendSuccess(res, { data: supplier, message: 'Tao nha cung cap thanh cong', statusCode: 201 });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const supplier = await suppliersService.update(Number(req.params.id), req.body);
    sendSuccess(res, { data: supplier, message: 'Cap nhat thanh cong' });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await suppliersService.remove(Number(req.params.id));
    sendSuccess(res, { message: 'Da xoa nha cung cap' });
  }),
};
