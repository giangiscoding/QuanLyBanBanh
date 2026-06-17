import { Router } from 'express';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { validate } from '../../common/middlewares/validate.middleware';
import { salesController } from './sales.controller';
import { createOrderSchema } from './sales.validation';

const router = Router();

router.use(authenticate);

// Xem danh sach va chi tiet don hang - tat ca nhan vien
router.get('/', salesController.list);
router.get('/:id', salesController.getById);

// Tao don hang moi - CASHIER tro len
router.post('/', authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(createOrderSchema), salesController.create);

// Huy don hang - chi ADMIN/MANAGER
router.patch('/:id/cancel', authorize('ADMIN', 'MANAGER'), salesController.cancel);

export const salesRoutes = router;
