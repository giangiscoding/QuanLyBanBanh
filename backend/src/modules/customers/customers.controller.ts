import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { customersService } from './customers.service';

export const customersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search } = req.query;
    const result = await customersService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const customer = await customersService.getById(Number(req.params.id));
    sendSuccess(res, { data: customer });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const customer = await customersService.create(req.body);
    sendSuccess(res, { data: customer, message: 'Tao khach hang thanh cong', statusCode: 201 });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const customer = await customersService.update(Number(req.params.id), req.body);
    sendSuccess(res, { data: customer, message: 'Cap nhat khach hang thanh cong' });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await customersService.remove(Number(req.params.id));
    sendSuccess(res, { message: 'Da xoa khach hang' });
  }),
};
