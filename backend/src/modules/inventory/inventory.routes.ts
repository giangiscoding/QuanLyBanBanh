import { Router } from 'express';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { validate } from '../../common/middlewares/validate.middleware';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { inventoryService } from './inventory.service';
import { adjustStockSchema } from './inventory.validation';

// 📌 Phu trach: NGUOI 2 (Luong Cung ung - Kho)

const router = Router();
router.use(authenticate);

// Canh bao san pham sap het hang
router.get(
  '/low-stock',
  asyncHandler(async (_req, res) => {
    const items = await inventoryService.lowStock();
    sendSuccess(res, { data: items });
  }),
);

// Lich su xuat/nhap kho (loc theo ?productId=)
router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const { page, limit, productId } = req.query;
    const result = await inventoryService.history({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      productId: productId ? Number(productId) : undefined,
    });
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),
);

// Dieu chinh / kiem ke ton kho - chi ADMIN/MANAGER
router.post(
  '/adjust',
  authorize('ADMIN', 'MANAGER'),
  validate(adjustStockSchema),
  asyncHandler(async (req, res) => {
    const product = await inventoryService.adjust(req.body);
    sendSuccess(res, { data: product, message: 'Da dieu chinh ton kho' });
  }),
);

export const inventoryRoutes = router;
