import { Router } from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { suppliersController } from './suppliers.controller';
import { createSupplierSchema, updateSupplierSchema } from './suppliers.validation';

const router = Router();

// Tat ca route nha cung cap deu can dang nhap
router.use(authenticate);

router.get('/', suppliersController.list);
router.get('/:id', suppliersController.getById);

// Them/sua/xoa - chi ADMIN/MANAGER
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createSupplierSchema), suppliersController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateSupplierSchema), suppliersController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), suppliersController.remove);

export const suppliersRoutes = router;