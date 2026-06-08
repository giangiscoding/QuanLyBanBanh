import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { productsService } from './products.service';

export const productsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, categoryId } = req.query;
    const result = await productsService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.getById(Number(req.params.id));
    sendSuccess(res, { data: product });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.create(req.body);
    sendSuccess(res, { data: product, message: 'Tao san pham thanh cong', statusCode: 201 });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.update(Number(req.params.id), req.body);
    sendSuccess(res, { data: product, message: 'Cap nhat thanh cong' });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await productsService.remove(Number(req.params.id));
    sendSuccess(res, { message: 'Da ngung kinh doanh san pham' });
  }),
};
