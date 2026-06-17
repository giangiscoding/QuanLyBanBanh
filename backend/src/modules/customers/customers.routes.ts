import { Router } from 'express';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { validate } from '../../common/middlewares/validate.middleware';
import { customersController } from './customers.controller';
import { createCustomerSchema, updateCustomerSchema } from './customers.validation';

const router = Router();

router.use(authenticate);

// Tat ca nhan vien deu xem duoc danh sach khach hang
router.get('/', customersController.list);
router.get('/:id', customersController.getById);

// Them/sua/xoa - chi ADMIN/MANAGER/CASHIER
router.post('/', authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(createCustomerSchema), customersController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(updateCustomerSchema), customersController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), customersController.remove);

export const customersRoutes = router;
