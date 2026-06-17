import type { User } from './AuthContext';

export type Role = User['role'];

// Cac nhom vai tro dung lai nhieu lan
export const ALL_ROLES: Role[] = ['ADMIN', 'MANAGER', 'CASHIER', 'STAFF'];
export const MANAGER_UP: Role[] = ['ADMIN', 'MANAGER'];
export const CASHIER_UP: Role[] = ['ADMIN', 'MANAGER', 'CASHIER'];

// Phan quyen su dung theo trang.
// - STAFF (nhan vien): chi mot vai tinh nang co ban (ban hang, san pham, khach hang)
// - CASHIER (thu ngan): them danh muc, kho
// - ADMIN/MANAGER: dung duoc moi tinh nang
export interface NavItem {
  path: string;
  label: string;
  icon: string; // ten icon (anh xa o MainLayout)
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/sales', label: 'Ban hang', icon: 'cart', roles: ALL_ROLES },
  { path: '/products', label: 'San pham', icon: 'appstore', roles: ALL_ROLES },
  { path: '/customers', label: 'Khach hang', icon: 'user', roles: ALL_ROLES },
  { path: '/categories', label: 'Danh muc', icon: 'tags', roles: CASHIER_UP },
  { path: '/inventory', label: 'Kho', icon: 'inbox', roles: CASHIER_UP },
  { path: '/purchasing', label: 'Nhap hang', icon: 'import', roles: MANAGER_UP },
  { path: '/suppliers', label: 'Nha cung cap', icon: 'shop', roles: MANAGER_UP },
  { path: '/employees', label: 'Nhan vien', icon: 'team', roles: MANAGER_UP },
  { path: '/reports', label: 'Bao cao', icon: 'chart', roles: MANAGER_UP },
];

// Kiem tra mot vai tro co duoc vao mot duong dan khong
export function canAccess(role: Role, path: string): boolean {
  const item = NAV_ITEMS.find((n) => path === n.path || path.startsWith(n.path + '/'));
  return item ? item.roles.includes(role) : true;
}

// Trang dau tien ma vai tro nay duoc phep vao (dung khi bi chuyen huong)
export function firstAllowedPath(role: Role): string {
  return NAV_ITEMS.find((n) => n.roles.includes(role))?.path ?? '/sales';
}
