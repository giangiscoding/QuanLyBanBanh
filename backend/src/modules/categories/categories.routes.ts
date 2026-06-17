import { Router } from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { categoriesController } from './categories.controller';
import { createCategorySchema, updateCategorySchema } from './categories.validation';

const router = Router();

// Tat ca route danh muc deu can dang nhap
router.use(authenticate);

router.get('/', categoriesController.list);
router.get('/:id', categoriesController.getById);

// Them/sua/xoa - chi ADMIN/MANAGER
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createCategorySchema), categoriesController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateCategorySchema), categoriesController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), categoriesController.remove);

export const categoriesRoutes = router;
