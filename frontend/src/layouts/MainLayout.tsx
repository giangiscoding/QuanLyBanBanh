import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  InboxOutlined,
  ImportOutlined,
  TeamOutlined,
  UserOutlined,
  ShopOutlined,
  BarChartOutlined,
  LogoutOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

const { Header, Sider, Content } = Layout;

// Menu sidebar - moi muc tro toi mot module
const menuItems = [
  { key: '/sales', icon: <ShoppingCartOutlined />, label: <Link to="/sales">Ban hang</Link> },
  { key: '/products', icon: <AppstoreOutlined />, label: <Link to="/products">San pham</Link> },
  { key: '/categories', icon: <TagsOutlined />, label: <Link to="/categories">Danh muc</Link> },
  { key: '/inventory', icon: <InboxOutlined />, label: <Link to="/inventory">Kho</Link> },
  { key: '/purchasing', icon: <ImportOutlined />, label: <Link to="/purchasing">Nhap hang</Link> },
  { key: '/suppliers', icon: <ShopOutlined />, label: <Link to="/suppliers">Nha cung cap</Link> },
  { key: '/customers', icon: <UserOutlined />, label: <Link to="/customers">Khach hang</Link> },
  { key: '/employees', icon: <TeamOutlined />, label: <Link to="/employees">Nhan vien</Link> },
  { key: '/reports', icon: <BarChartOutlined />, label: <Link to="/reports">Bao cao</Link> },
];

export default function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="dark">
        <div style={{ height: 48, margin: 16, color: '#fff', fontWeight: 700, fontSize: 18 }}>
          🍞 Ban Banh
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingInline: 24 }}>
          <Dropdown
            menu={{
              items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Dang xuat', onClick: logout }],
            }}
          >
            <span style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <Typography.Text strong>{user?.username}</Typography.Text>
              <Typography.Text type="secondary"> ({user?.role})</Typography.Text>
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
