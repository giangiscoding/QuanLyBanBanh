import { Router } from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { authenticate, authorize } from '../../common/middlewares/auth.middleware';
import { purchasingController } from './purchasing.controller';
import { createPurchaseOrderSchema } from './purchasing.validation';

// 📌 Phu trach: NGUOI 2 (Luong Cung ung - Kho)

const router = Router();
router.use(authenticate);

router.get('/', purchasingController.list);
router.get('/:id', purchasingController.getById);

// Tao phieu nhap - chi ADMIN/MANAGER
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createPurchaseOrderSchema), purchasingController.create);

// Xac nhan da nhan hang cho phieu dang PENDING -> cong ton kho
router.put('/:id/receive', authorize('ADMIN', 'MANAGER'), purchasingController.receive);

export const purchasingRoutes = router;