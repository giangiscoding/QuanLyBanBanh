import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { canAccess, firstAllowedPath } from '@/store/permissions';

// Chan vao trang khong thuoc quyen cua vai tro hien tai.
// Vi dung location.pathname nen mot lop guard ap dung cho moi route con.
export default function RoleRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null; // ProtectedRoute da xu ly truong hop chua dang nhap

  if (!canAccess(user.role, location.pathname)) {
    return <Navigate to={firstAllowedPath(user.role)} replace />;
  }

  return <Outlet />;
}
