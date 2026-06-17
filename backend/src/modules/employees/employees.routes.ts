import { Router } from 'express';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { validate } from '../../common/middlewares/validate.middleware';
import { employeesController } from './employees.controller';
import { createEmployeeSchema, updateEmployeeSchema } from './employees.validation';

const router = Router();

router.use(authenticate);

// Chi ADMIN/MANAGER duoc quan ly nhan vien
router.get('/', authorize('ADMIN', 'MANAGER'), employeesController.list);
router.get('/:id/detail', authorize('ADMIN', 'MANAGER'), employeesController.getDetail);
router.get('/:id', authorize('ADMIN', 'MANAGER'), employeesController.getById);
router.post('/', authorize('ADMIN'), validate(createEmployeeSchema), employeesController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateEmployeeSchema), employeesController.update);
router.delete('/:id', authorize('ADMIN'), employeesController.remove);

export const employeesRoutes = router;
