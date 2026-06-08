import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';

// 📌 Phu trach: NGUOI 1 (Truong nhom)
// TODO: Lam CRUD danh muc san pham theo mau module 'products'
//   - categories.validation.ts / .service.ts / .controller.ts
//   - GET /  GET /:id  POST /  PUT /:id  DELETE /:id

const router = Router();
router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'Module Categories - chua trien khai', data: [] });
});

export const categoriesRoutes = router;
