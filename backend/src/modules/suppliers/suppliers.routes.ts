import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';

// 📌 Phu trach: NGUOI 2 (Luong Cung ung - Kho)
// TODO: CRUD nha cung cap theo mau module 'products'

const router = Router();
router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'Module Suppliers - chua trien khai', data: [] });
});

export const suppliersRoutes = router;
