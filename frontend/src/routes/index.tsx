import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import PlaceholderPage from '@/components/PlaceholderPage';
import LoginPage from '@/modules/auth/LoginPage';
import ProductsPage from '@/modules/products/ProductsPage';
import PurchasingPage from '@/modules/purchasing/PurchasingPage';
import SuppliersPage from '@/modules/suppliers/SuppliersPage';

// Moi nguoi thay PlaceholderPage bang trang that cua module minh.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/products" replace /> },
          { path: '/products', element: <ProductsPage /> }, // Nguoi 1 (mau)
          { path: '/categories', element: <PlaceholderPage title="Danh muc" owner="Nguoi 1" /> },
          { path: '/reports', element: <PlaceholderPage title="Bao cao" owner="Nguoi 1" /> },
          { path: '/suppliers', element: <SuppliersPage /> },
          { path: '/purchasing', element: <PurchasingPage /> },
          { path: '/inventory', element: <PlaceholderPage title="Kho" owner="Nguoi 2" /> },
          { path: '/customers', element: <PlaceholderPage title="Khach hang" owner="Nguoi 3" /> },
          { path: '/sales', element: <PlaceholderPage title="Ban hang" owner="Nguoi 3" /> },
          { path: '/employees', element: <PlaceholderPage title="Nhan vien" owner="Nguoi 3" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
