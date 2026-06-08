import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';

// 📌 Phu trach: NGUOI 3 (Luong Ban hang)
// TODO: Tao don hang (POS). Khi ban thanh cong PHAI goi
//   inventoryService.stockMovement({ type: 'OUT', ... }) de tru ton kho.
//   Boc toan bo (tao order + order_items + tru kho) trong prisma.$transaction.

const router = Router();
router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'Module Sales - chua trien khai', data: [] });
});

export const salesRoutes = router;
