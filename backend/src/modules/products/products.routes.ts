import { Router } from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { productsController } from './products.controller';
import { createProductSchema, updateProductSchema } from './products.validation';

const router = Router();

// Tat ca route san pham deu can dang nhap
router.use(authenticate);

router.get('/', productsController.list);
router.get('/:id', productsController.getById);

// Them/sua/xoa - chi ADMIN/MANAGER
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createProductSchema), productsController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateProductSchema), productsController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), productsController.remove);

export const productsRoutes = router;
