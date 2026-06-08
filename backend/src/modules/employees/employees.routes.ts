import { Router } from 'express';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';

// 📌 Phu trach: NGUOI 3 (Luong Ban hang)
// TODO: CRUD nhan vien. Chi ADMIN/MANAGER duoc quan ly.

const router = Router();
router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER'), (_req, res) => {
  res.json({ success: true, message: 'Module Employees - chua trien khai', data: [] });
});

export const employeesRoutes = router;
