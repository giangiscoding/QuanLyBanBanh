import { Router } from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { purchasingController } from './purchasing.controller';
import { createPurchaseSchema } from './purchasing.validation';

const router = Router();

// Nhap hang chi danh cho ADMIN/MANAGER (ca xem lan tao phieu)
router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/', purchasingController.list);
router.get('/:id', purchasingController.getById);

// Tao phieu nhap - khi tao se tu dong cong ton kho.
router.post('/', validate(createPurchaseSchema), purchasingController.create);

export const purchasingRoutes = router;
