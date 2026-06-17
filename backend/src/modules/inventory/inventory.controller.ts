import { Request, Response } from 'express';
import { StockMovementType } from '@prisma/client';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { inventoryService } from './inventory.service';

export const inventoryController = {
  lowStock: asyncHandler(async (_req: Request, res: Response) => {
    const items = await inventoryService.lowStock();
    sendSuccess(res, { data: items });
  }),

  movements: asyncHandler(async (req: Request, res: Response) => {
    const { productId, type, page, limit } = req.query;
    const result = await inventoryService.history({
      productId: productId ? Number(productId) : undefined,
      type: type as StockMovementType | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  adjust: asyncHandler(async (req: Request, res: Response) => {
    const result = await inventoryService.adjust(req.body);
    sendSuccess(res, { data: result, message: 'Dieu chinh ton kho thanh cong' });
  }),
};
