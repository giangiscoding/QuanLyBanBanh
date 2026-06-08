import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { sendSuccess } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { inventoryService } from './inventory.service';

// 📌 Phu trach: NGUOI 2 (Luong Cung ung - Kho)
// TODO: them route lich su xuat/nhap, kiem ke...

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

export const inventoryRoutes = router;
