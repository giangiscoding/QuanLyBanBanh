import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { categoriesService } from './categories.service';

export const categoriesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search } = req.query;
    const result = await categoriesService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.getById(Number(req.params.id));
    sendSuccess(res, { data: category });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.create(req.body);
    sendSuccess(res, { data: category, message: 'Tao danh muc thanh cong', statusCode: 201 });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.update(Number(req.params.id), req.body);
    sendSuccess(res, { data: category, message: 'Cap nhat thanh cong' });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoriesService.remove(Number(req.params.id));
    sendSuccess(res, { message: 'Da xoa danh muc' });
  }),
};
