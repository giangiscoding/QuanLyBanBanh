import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import LoginPage from '@/modules/auth/LoginPage';
import ProductsPage from '@/modules/products/ProductsPage';
import CategoriesPage from '@/modules/categories/CategoriesPage';
import SuppliersPage from '@/modules/suppliers/SuppliersPage';
import CustomersPage from '@/modules/customers/CustomersPage';
import EmployeesPage from '@/modules/employees/EmployeesPage';
import InventoryPage from '@/modules/inventory/InventoryPage';
import PurchasingPage from '@/modules/purchasing/PurchasingPage';
import SalesPage from '@/modules/sales/SalesPage';
import ReportsPage from '@/modules/reports/ReportsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/sales" replace /> },
          {
            element: <RoleRoute />,
            children: [
              { path: '/sales', element: <SalesPage /> },
              { path: '/products', element: <ProductsPage /> },
              { path: '/categories', element: <CategoriesPage /> },
              { path: '/inventory', element: <InventoryPage /> },
              { path: '/purchasing', element: <PurchasingPage /> },
              { path: '/suppliers', element: <SuppliersPage /> },
              { path: '/customers', element: <CustomersPage /> },
              { path: '/employees', element: <EmployeesPage /> },
              { path: '/reports', element: <ReportsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
