import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  InputNumber,
  Modal,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api, type ApiResponse } from '@/services/api';
import { getErrorMessage } from '@/services/error';
import { useAuth } from '@/store/AuthContext';

interface Product {
  id: number;
  sku: string;
  name: string;
  stockQuantity: number;
  minStock: number;
}

interface Movement {
  id: number;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  referenceType: string | null;
  note: string | null;
  createdAt: string;
  product?: { id: number; sku: string; name: string };
}

const typeTag: Record<Movement['type'], { color: string; label: string }> = {
  IN: { color: 'green', label: 'Nhap' },
  OUT: { color: 'red', label: 'Xuat' },
  ADJUST: { color: 'orange', label: 'Dieu chinh' },
};

export default function InventoryPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [history, setHistory] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<ApiResponse<Product[]>>('/inventory/low-stock'),
      api.get<ApiResponse<Movement[]>>('/inventory/history?limit=100'),
    ])
      .then(([low, hist]) => {
        setLowStock(low.data.data);
        setHistory(hist.data.data);
      })
      .catch((e) => message.error(getErrorMessage(e, 'Khong tai duoc du lieu kho')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdjust = () => {
    form.resetFields();
    api
      .get<ApiResponse<Product[]>>('/products?limit=1000')
      .then((res) => setProducts(res.data.data))
      .catch(() => message.error('Khong tai duoc san pham'));
    setOpen(true);
  };

  const submitAdjust = async () => {
    const values = await form.validateFields();
    try {
      await api.post('/inventory/adjust', values);
      message.success('Da dieu chinh ton kho');
      setOpen(false);
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const lowColumns: ColumnsType<Product> = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Ten san pham', dataIndex: 'name', key: 'name' },
    {
      title: 'Ton kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (v: number) => <Tag color="red">{v}</Tag>,
    },
    { title: 'Nguong toi thieu', dataIndex: 'minStock', key: 'minStock' },
  ];

  const histColumns: ColumnsType<Movement> = [
    {
      title: 'Thoi gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('vi-VN'),
    },
    { title: 'San pham', key: 'product', render: (_, r) => r.product?.name ?? '—' },
    {
      title: 'Loai',
      dataIndex: 'type',
      key: 'type',
      render: (t: Movement['type']) => <Tag color={typeTag[t].color}>{typeTag[t].label}</Tag>,
    },
    { title: 'So luong', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Ghi chu', dataIndex: 'note', key: 'note', render: (v) => v ?? '—' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Quan ly kho
        </Typography.Title>
        {canEdit && (
          <Button type="primary" icon={<ToolOutlined />} onClick={openAdjust}>
            Kiem ke / Dieu chinh
          </Button>
        )}
      </div>

      <Tabs
        defaultActiveKey="low"
        items={[
          {
            key: 'low',
            label: `Canh bao het hang (${lowStock.length})`,
            children: <Table rowKey="id" columns={lowColumns} dataSource={lowStock} loading={loading} />,
          },
          {
            key: 'history',
            label: 'Lich su xuat / nhap',
            children: <Table rowKey="id" columns={histColumns} dataSource={history} loading={loading} />,
          },
        ]}
      />

      <Modal
        title="Kiem ke / Dieu chinh ton kho"
        open={open}
        onOk={submitAdjust}
        onCancel={() => setOpen(false)}
        okText="Luu"
        cancelText="Huy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="productId" label="San pham" rules={[{ required: true, message: 'Chon san pham' }]}>
            <Select
              showSearch
              placeholder="Chon san pham"
              optionFilterProp="label"
              options={products.map((p) => ({
                value: p.id,
                label: `${p.sku} - ${p.name} (ton: ${p.stockQuantity})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="countedQuantity"
            label="So luong dem duoc thuc te"
            rules={[{ required: true, message: 'Nhap so luong' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
