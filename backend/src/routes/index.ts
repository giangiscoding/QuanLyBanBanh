import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { productsRoutes } from '../modules/products/products.routes';
import { categoriesRoutes } from '../modules/categories/categories.routes';
import { suppliersRoutes } from '../modules/suppliers/suppliers.routes';
import { inventoryRoutes } from '../modules/inventory/inventory.routes';
import { purchasingRoutes } from '../modules/purchasing/purchasing.routes';
import { customersRoutes } from '../modules/customers/customers.routes';
import { salesRoutes } from '../modules/sales/sales.routes';
import { employeesRoutes } from '../modules/employees/employees.routes';
import { reportsRoutes } from '../modules/reports/reports.routes';

// Gom toan bo route cua cac module. Moi nguoi them route module cua minh o day.
const router = Router();

router.use('/auth', authRoutes); // Nguoi 1
router.use('/products', productsRoutes); // Nguoi 1
router.use('/categories', categoriesRoutes); // Nguoi 1
router.use('/reports', reportsRoutes); // Nguoi 1

router.use('/suppliers', suppliersRoutes); // Nguoi 2
router.use('/purchasing', purchasingRoutes); // Nguoi 2
router.use('/inventory', inventoryRoutes); // Nguoi 2

router.use('/customers', customersRoutes); // Nguoi 3
router.use('/sales', salesRoutes); // Nguoi 3
router.use('/employees', employeesRoutes); // Nguoi 3

export const apiRouter = router;
