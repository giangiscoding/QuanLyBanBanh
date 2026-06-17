import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api, type ApiResponse } from '@/services/api';
import { getErrorMessage } from '@/services/error';
import { useAuth } from '@/store/AuthContext';

interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  _count?: { purchaseOrders: number };
}

export default function SuppliersPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Supplier[]>>('/suppliers')
      .then((res) => setData(res.data.data))
      .catch((e) => message.error(getErrorMessage(e, 'Khong tai duoc nha cung cap')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: Supplier) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/suppliers/${editing.id}`, values);
        message.success('Cap nhat thanh cong');
      } else {
        await api.post('/suppliers', values);
        message.success('Tao nha cung cap thanh cong');
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/suppliers/${id}`);
      message.success('Da xoa');
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const columns: ColumnsType<Supplier> = [
    { title: 'Ten nha cung cap', dataIndex: 'name', key: 'name' },
    { title: 'Dien thoai', dataIndex: 'phone', key: 'phone', render: (v) => v ?? '—' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v) => v ?? '—' },
    { title: 'Dia chi', dataIndex: 'address', key: 'address', render: (v) => v ?? '—' },
    { title: 'So phieu nhap', key: 'count', render: (_, r) => r._count?.purchaseOrders ?? 0 },
    ...(canEdit
      ? [
          {
            title: 'Thao tac',
            key: 'actions',
            width: 160,
            render: (_: unknown, r: Supplier) => (
              <Space>
                <Button size="small" onClick={() => openEdit(r)}>
                  Sua
                </Button>
                <Popconfirm title="Xoa nha cung cap nay?" onConfirm={() => remove(r.id)}>
                  <Button size="small" danger>
                    Xoa
                  </Button>
                </Popconfirm>
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
          Nha cung cap
        </Typography.Title>
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Them nha cung cap
          </Button>
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />

      <Modal
        title={editing ? 'Sua nha cung cap' : 'Them nha cung cap'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        okText="Luu"
        cancelText="Huy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Ten nha cung cap" rules={[{ required: true, message: 'Nhap ten' }]}>
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
        </Form>
      </Modal>
    </div>
  );
}
