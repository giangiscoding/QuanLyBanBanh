import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api, type ApiResponse } from '@/services/api';
import { getErrorMessage, formatVND } from '@/services/error';
import { useAuth } from '@/store/AuthContext';

interface Product {
  id: number;
  sku: string;
  name: string;
  salePrice: string;
  costPrice: string;
  stockQuantity: number;
  minStock: number;
  imageUrl: string | null;
  isActive: boolean;
  category?: { id: number; name: string } | null;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [data, setData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Product[]>>('/products?limit=1000')
      .then((res) => setData(res.data.data))
      .catch((e) => message.error(getErrorMessage(e, 'Khong tai duoc san pham')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api
      .get<ApiResponse<Category[]>>('/categories?limit=1000')
      .then((res) => setCategories(res.data.data))
      .catch(() => undefined);
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, costPrice: 0, minStock: 0 });
    setOpen(true);
  };

  const openEdit = (record: Product) => {
    setEditing(record);
    form.setFieldsValue({
      sku: record.sku,
      name: record.name,
      categoryId: record.category?.id,
      salePrice: Number(record.salePrice),
      costPrice: Number(record.costPrice),
      minStock: record.minStock,
      imageUrl: record.imageUrl ?? undefined,
      isActive: record.isActive,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    // Bo cac chuoi rong de tranh loi validate (vd: imageUrl phai la URL hop le)
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v !== '' && v !== undefined) payload[k] = v;
    }
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        message.success('Cap nhat thanh cong');
      } else {
        await api.post('/products', payload);
        message.success('Tao san pham thanh cong');
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Da ngung kinh doanh san pham');
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const columns: ColumnsType<Product> = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Ten san pham', dataIndex: 'name', key: 'name' },
    { title: 'Danh muc', key: 'category', render: (_, r) => r.category?.name ?? '—' },
    { title: 'Gia ban', dataIndex: 'salePrice', key: 'salePrice', render: (v) => formatVND(v) },
    { title: 'Gia von', dataIndex: 'costPrice', key: 'costPrice', render: (v) => formatVND(v) },
    { title: 'Ton kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
    {
      title: 'Trang thai',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) =>
        active ? <Tag color="green">Dang ban</Tag> : <Tag color="red">Ngung</Tag>,
    },
    ...(canEdit
      ? [
          {
            title: 'Thao tac',
            key: 'actions',
            width: 160,
            render: (_: unknown, r: Product) => (
              <Space>
                <Button size="small" onClick={() => openEdit(r)}>
                  Sua
                </Button>
                {r.isActive && (
                  <Popconfirm title="Ngung kinh doanh san pham nay?" onConfirm={() => remove(r.id)}>
                    <Button size="small" danger>
                      Ngung
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
          San pham
        </Typography.Title>
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Them san pham
          </Button>
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />

      <Modal
        title={editing ? 'Sua san pham' : 'Them san pham'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        okText="Luu"
        cancelText="Huy"
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="sku" label="Ma SKU" rules={[{ required: true, message: 'Nhap ma SKU' }]} style={{ width: 200 }}>
              <Input placeholder="VD: BK005" />
            </Form.Item>
            <Form.Item name="categoryId" label="Danh muc" style={{ width: 280 }}>
              <Select
                allowClear
                showSearch
                placeholder="Chon danh muc"
                optionFilterProp="label"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Space>

          <Form.Item name="name" label="Ten san pham" rules={[{ required: true, message: 'Nhap ten san pham' }]}>
            <Input />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="start">
            <Form.Item
              name="salePrice"
              label="Gia ban (đ)"
              rules={[{ required: true, message: 'Nhap gia ban' }]}
              style={{ width: 160 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="costPrice" label="Gia von (đ)" style={{ width: 160 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="minStock" label="Ton toi thieu" style={{ width: 140 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item name="imageUrl" label="Link hinh anh" rules={[{ type: 'url', message: 'URL khong hop le' }]}>
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="isActive" label="Dang kinh doanh" valuePropName="checked">
            <Switch />
          </Form.Item>

          {!editing && (
            <Typography.Text type="secondary">
              * Ton kho ban dau = 0. Tang ton kho qua module Nhap hang hoac Kiem ke.
            </Typography.Text>
          )}
        </Form>
      </Modal>
    </div>
  );
}
