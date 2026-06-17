import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api, type ApiResponse } from '@/services/api';
import { getErrorMessage } from '@/services/error';
import { useAuth } from '@/store/AuthContext';

interface Category {
  id: number;
  name: string;
  description: string | null;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Category[]>>('/categories')
      .then((res) => setData(res.data.data))
      .catch((e) => message.error(getErrorMessage(e, 'Khong tai duoc danh muc')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: Category) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, values);
        message.success('Cap nhat thanh cong');
      } else {
        await api.post('/categories', values);
        message.success('Tao danh muc thanh cong');
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      message.success('Da xoa');
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const columns: ColumnsType<Category> = [
    { title: 'Ten danh muc', dataIndex: 'name', key: 'name' },
    { title: 'Mo ta', dataIndex: 'description', key: 'description', render: (v) => v ?? '—' },
    { title: 'So san pham', key: 'count', render: (_, r) => r._count?.products ?? 0 },
    ...(canEdit
      ? [
          {
            title: 'Thao tac',
            key: 'actions',
            width: 160,
            render: (_: unknown, r: Category) => (
              <Space>
                <Button size="small" onClick={() => openEdit(r)}>
                  Sua
                </Button>
                <Popconfirm title="Xoa danh muc nay?" onConfirm={() => remove(r.id)}>
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
          Danh muc
        </Typography.Title>
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Them danh muc
          </Button>
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />

      <Modal
        title={editing ? 'Sua danh muc' : 'Them danh muc'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        okText="Luu"
        cancelText="Huy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Ten danh muc" rules={[{ required: true, message: 'Nhap ten danh muc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mo ta">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
