import { Router } from 'express';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { reportsController } from './reports.controller';

// 📌 Phu trach: NGUOI 1 (Truong nhom)
// Bao cao tong hop tu nhieu module - chi ADMIN/MANAGER duoc xem.

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

// Tham so chung: ?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/revenue', reportsController.revenue);
router.get('/revenue-by-day', reportsController.revenueByDay);
router.get('/top-products', reportsController.topProducts);
router.get('/inventory', reportsController.inventory);

export const reportsRoutes = router;
