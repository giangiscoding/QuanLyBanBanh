import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';

// 📌 Phu trach: NGUOI 2 (Luong Cung ung - Kho)
// TODO: Tao phieu nhap hang. Khi nhap thanh cong PHAI goi
//   inventoryService.stockMovement({ type: 'IN', ... }) de cong ton kho.
//   Nen boc trong prisma.$transaction de dam bao toan ven du lieu.

const router = Router();
router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'Module Purchasing - chua trien khai', data: [] });
});

export const purchasingRoutes = router;
