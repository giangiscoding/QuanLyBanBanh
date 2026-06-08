import { Button, Card, Form, Input, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/store/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Dang nhap thanh cong');
      navigate('/products');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Dang nhap that bai';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 380 }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          🍞 Quan Ly Ban Banh
        </Typography.Title>
        <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Form.Item name="username" rules={[{ required: true, message: 'Nhap ten dang nhap' }]}>
            <Input prefix={<UserOutlined />} placeholder="Ten dang nhap" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Nhap mat khau' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mat khau" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Dang nhap
          </Button>
        </Form>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
          Tai khoan mac dinh: admin / admin123
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
