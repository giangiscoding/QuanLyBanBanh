import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';

// 📌 Phu trach: NGUOI 3 (Luong Ban hang)
// TODO: CRUD khach hang theo mau module 'products'

const router = Router();
router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'Module Customers - chua trien khai', data: [] });
});

export const customersRoutes = router;
