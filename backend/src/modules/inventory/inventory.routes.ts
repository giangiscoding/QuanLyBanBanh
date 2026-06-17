import { Router } from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { inventoryController } from './inventory.controller';
import { adjustStockSchema } from './inventory.validation';

// 📌 Phu trach: NGUOI 2 (Luong Cung ung - Kho)

const router = Router();
router.use(authenticate);

// Canh bao san pham sap het hang
router.get('/low-stock', inventoryController.lowStock);

// Lich su xuat/nhap kho - loc duoc theo ?productId= va/hoac ?type=IN|OUT|ADJUST
router.get('/movements', inventoryController.movements);

// Kiem ke / dieu chinh ton kho - chi ADMIN/MANAGER
router.post('/adjust', authorize('ADMIN', 'MANAGER'), validate(adjustStockSchema), inventoryController.adjust);

export const inventoryRoutes = router;