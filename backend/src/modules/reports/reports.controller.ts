import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { reportsService } from './reports.service';

function parseRange(req: Request) {
  const { from, to } = req.query;
  return {
    from: from ? new Date(String(from)) : undefined,
    to: to ? new Date(String(to)) : undefined,
  };
}

export const reportsController = {
  revenue: asyncHandler(async (req: Request, res: Response) => {
    const data = await reportsService.revenue(parseRange(req));
    sendSuccess(res, { data });
  }),

  revenueByDay: asyncHandler(async (req: Request, res: Response) => {
    const data = await reportsService.revenueByDay(parseRange(req));
    sendSuccess(res, { data });
  }),

  topProducts: asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const data = await reportsService.topProducts({
      ...parseRange(req),
      limit: limit ? Number(limit) : undefined,
    });
    sendSuccess(res, { data });
  }),

  inventory: asyncHandler(async (_req: Request, res: Response) => {
    const data = await reportsService.inventory();
    sendSuccess(res, { data });
  }),
};
