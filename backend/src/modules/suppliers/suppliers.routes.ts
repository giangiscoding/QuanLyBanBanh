import { Router } from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { suppliersController } from './suppliers.controller';
import { createSupplierSchema, updateSupplierSchema } from './suppliers.validation';

const router = Router();

// Quan ly nha cung cap chi danh cho ADMIN/MANAGER (ca xem lan chinh sua)
router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/', suppliersController.list);
router.get('/:id', suppliersController.getById);
router.post('/', validate(createSupplierSchema), suppliersController.create);
router.put('/:id', validate(updateSupplierSchema), suppliersController.update);
router.delete('/:id', suppliersController.remove);

export const suppliersRoutes = router;
