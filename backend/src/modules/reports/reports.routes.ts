import { Router } from 'express';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';

// 📌 Phu trach: NGUOI 1 (Truong nhom) - lam SAU CUNG vi can du lieu tu moi module
// TODO: bao cao doanh thu, loi nhuan, top san phan ban chay, ton kho...
//   Dung prisma groupBy / aggregate / raw query.

const router = Router();
router.use(authenticate);

router.get('/revenue', authorize('ADMIN', 'MANAGER'), (_req, res) => {
  res.json({ success: true, message: 'Module Reports - chua trien khai', data: [] });
});

export const reportsRoutes = router;
