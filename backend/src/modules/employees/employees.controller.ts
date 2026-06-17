import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { employeesService } from './employees.service';

export const employeesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search } = req.query;
    const result = await employeesService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.getById(Number(req.params.id));
    sendSuccess(res, { data: employee });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.create(req.body);
    sendSuccess(res, { data: employee, message: 'Tao nhan vien thanh cong', statusCode: 201 });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.update(Number(req.params.id), req.body);
    sendSuccess(res, { data: employee, message: 'Cap nhat nhan vien thanh cong' });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await employeesService.remove(Number(req.params.id));
    sendSuccess(res, { message: 'Da xoa nhan vien' });
  }),
};
