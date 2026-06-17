import { useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api, type ApiResponse } from '@/services/api';
import { getErrorMessage, formatVND } from '@/services/error';
import { useAuth } from '@/store/AuthContext';

interface Product {
  id: number;
  sku: string;
  name: string;
  costPrice: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface PurchaseOrder {
  id: number;
  code: string;
  totalAmount: string;
  createdAt: string;
  supplier?: { id: number; name: string } | null;
  employee?: { id: number; fullName: string } | null;
  _count?: { items: number };
}

export default function PurchasingPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<PurchaseOrder[]>>('/purchasing')
      .then((res) => setData(res.data.data))
      .catch((e) => message.error(getErrorMessage(e, 'Khong tai duoc phieu nhap')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ items: [{}] });
    Promise.all([
      api.get<ApiResponse<Product[]>>('/products?limit=1000'),
      api.get<ApiResponse<Supplier[]>>('/suppliers?limit=1000'),
    ])
      .then(([p, s]) => {
        setProducts(p.data.data);
        setSuppliers(s.data.data);
      })
      .catch(() => message.error('Khong tai duoc san pham / nha cung cap'));
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      await api.post('/purchasing', values);
      message.success('Tao phieu nhap thanh cong');
      setOpen(false);
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  // Khi chon san pham, tu dong dien gia von goi y
  const onSelectProduct = (productId: number, fieldName: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const items = form.getFieldValue('items');
      items[fieldName] = { ...items[fieldName], unitCost: Number(product.costPrice) };
      form.setFieldsValue({ items });
    }
  };

  const columns: ColumnsType<PurchaseOrder> = [
    { title: 'Ma phieu', dataIndex: 'code', key: 'code' },
    { title: 'Nha cung cap', key: 'supplier', render: (_, r) => r.supplier?.name ?? '—' },
    { title: 'So mat hang', key: 'count', render: (_, r) => r._count?.items ?? 0 },
    { title: 'Tong tien', dataIndex: 'totalAmount', key: 'totalAmount', render: (v) => formatVND(v) },
    { title: 'Nguoi nhap', key: 'employee', render: (_, r) => r.employee?.fullName ?? '—' },
    {
      title: 'Ngay',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Nhap hang
        </Typography.Title>
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Tao phieu nhap
          </Button>
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />

      <Modal
        title="Tao phieu nhap hang"
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        okText="Tao phieu"
        cancelText="Huy"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="supplierId" label="Nha cung cap">
            <Select
              allowClear
              showSearch
              placeholder="Chon nha cung cap"
              optionFilterProp="label"
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>

          <Divider>Danh sach mat hang nhap</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...rest}
                      name={[name, 'productId']}
                      rules={[{ required: true, message: 'Chon SP' }]}
                      style={{ width: 280 }}
                    >
                      <Select
                        showSearch
                        placeholder="San pham"
                        optionFilterProp="label"
                        onChange={(v) => onSelectProduct(v, name)}
                        options={products.map((p) => ({ value: p.id, label: `${p.sku} - ${p.name}` }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'SL' }]}
                    >
                      <InputNumber min={1} placeholder="So luong" />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, 'unitCost']}
                      rules={[{ required: true, message: 'Gia' }]}
                    >
                      <InputNumber min={0} placeholder="Gia nhap" style={{ width: 130 }} />
                    </Form.Item>
                    {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                  </Space>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                  Them mat hang
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item name="note" label="Ghi chu" style={{ marginTop: 16 }}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
