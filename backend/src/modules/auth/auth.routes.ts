import { Router } from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

// Dang nhap (cong khai)
router.post('/login', validate(loginSchema), authController.login);

// Tao tai khoan - chi ADMIN/MANAGER moi duoc tao
router.post(
  '/register',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(registerSchema),
  authController.register,
);

// Thong tin tai khoan dang dang nhap
router.get('/me', authenticate, authController.me);

export const authRoutes = router;
