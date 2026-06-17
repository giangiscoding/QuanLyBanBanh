import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api, type ApiResponse } from '@/services/api';
import { getErrorMessage } from '@/services/error';
import { useAuth } from '@/store/AuthContext';

interface Customer {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  points: number;
}

export default function CustomersPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'CASHIER';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Customer[]>>('/customers')
      .then((res) => setData(res.data.data))
      .catch((e) => message.error(getErrorMessage(e, 'Khong tai duoc khach hang')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: Customer) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, values);
        message.success('Cap nhat thanh cong');
      } else {
        await api.post('/customers', values);
        message.success('Them khach hang thanh cong');
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/customers/${id}`);
      message.success('Da xoa');
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const columns: ColumnsType<Customer> = [
    { title: 'Ho ten', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Dien thoai', dataIndex: 'phone', key: 'phone', render: (v) => v ?? '—' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v) => v ?? '—' },
    { title: 'Diem tich luy', dataIndex: 'points', key: 'points' },
    ...(canEdit
      ? [
          {
            title: 'Thao tac',
            key: 'actions',
            width: 160,
            render: (_: unknown, r: Customer) => (
              <Space>
                <Button size="small" onClick={() => openEdit(r)}>
                  Sua
                </Button>
                {canDelete && (
                  <Popconfirm title="Xoa khach hang nay?" onConfirm={() => remove(r.id)}>
                    <Button size="small" danger>
                      Xoa
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Khach hang
        </Typography.Title>
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Them khach hang
          </Button>
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />

      <Modal
        title={editing ? 'Sua khach hang' : 'Them khach hang'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        okText="Luu"
        cancelText="Huy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="Ho ten" rules={[{ required: true, message: 'Nhap ho ten' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Dien thoai">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email khong hop le' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Dia chi">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="points" label="Diem tich luy">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
