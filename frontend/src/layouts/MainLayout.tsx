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
import type { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { NAV_ITEMS } from '@/store/permissions';

const { Header, Sider, Content } = Layout;

// Anh xa ten icon (trong permissions) sang component icon
const ICONS: Record<string, ReactNode> = {
  cart: <ShoppingCartOutlined />,
  appstore: <AppstoreOutlined />,
  tags: <TagsOutlined />,
  inbox: <InboxOutlined />,
  import: <ImportOutlined />,
  shop: <ShopOutlined />,
  user: <UserOutlined />,
  team: <TeamOutlined />,
  chart: <BarChartOutlined />,
};

export default function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Chi hien muc menu ma vai tro hien tai duoc phep dung
  const menuItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role)).map(
    (item) => ({
      key: item.path,
      icon: ICONS[item.icon],
      label: <Link to={item.path}>{item.label}</Link>,
    }),
  );

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
