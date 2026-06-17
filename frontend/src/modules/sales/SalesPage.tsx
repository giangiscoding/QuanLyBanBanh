import { useEffect, useState } from 'react';
import {
  Button,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
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
  salePrice: string;
  stockQuantity: number;
}

interface Customer {
  id: number;
  fullName: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product?: { id: number; sku: string; name: string };
}

interface Order {
  id: number;
  code: string;
  finalAmount: string;
  discount: string;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  customer?: { id: number; fullName: string } | null;
  employee?: { id: number; fullName: string } | null;
  items?: OrderItem[];
  _count?: { items: number };
}

const statusTag: Record<Order['status'], { color: string; label: string }> = {
  PENDING: { color: 'gold', label: 'Cho xu ly' },
  COMPLETED: { color: 'green', label: 'Hoan thanh' },
  CANCELLED: { color: 'red', label: 'Da huy' },
};

const payLabel: Record<Order['paymentMethod'], string> = {
  CASH: 'Tien mat',
  CARD: 'The',
  TRANSFER: 'Chuyen khoan',
};

export default function SalesPage() {
  const { user } = useAuth();
  const canSell = ['ADMIN', 'MANAGER', 'CASHIER'].includes(user?.role ?? '');
  const canCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Order[]>>('/sales')
      .then((res) => setData(res.data.data))
      .catch((e) => message.error(getErrorMessage(e, 'Khong tai duoc don hang')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ paymentMethod: 'CASH', discount: 0, items: [{}] });
    Promise.all([
      api.get<ApiResponse<Product[]>>('/products?limit=1000'),
      api.get<ApiResponse<Customer[]>>('/customers?limit=1000'),
    ])
      .then(([p, c]) => {
        setProducts(p.data.data.filter((x) => x.stockQuantity > 0));
        setCustomers(c.data.data);
      })
      .catch(() => message.error('Khong tai duoc san pham / khach hang'));
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      await api.post('/sales', values);
      message.success('Tao don hang thanh cong');
      setOpen(false);
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const cancel = async (id: number) => {
    try {
      await api.patch(`/sales/${id}/cancel`);
      message.success('Da huy don hang');
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const viewDetail = async (id: number) => {
    try {
      const res = await api.get<ApiResponse<Order>>(`/sales/${id}`);
      setDetail(res.data.data);
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const columns: ColumnsType<Order> = [
    { title: 'Ma don', dataIndex: 'code', key: 'code' },
    { title: 'Khach hang', key: 'customer', render: (_, r) => r.customer?.fullName ?? 'Khach le' },
    { title: 'So mat hang', key: 'count', render: (_, r) => r._count?.items ?? r.items?.length ?? 0 },
    {
      title: 'Thanh tien',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (v) => formatVND(v),
    },
    {
      title: 'Thanh toan',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (v: Order['paymentMethod']) => payLabel[v],
    },
    {
      title: 'Trang thai',
      dataIndex: 'status',
      key: 'status',
      render: (s: Order['status']) => <Tag color={statusTag[s].color}>{statusTag[s].label}</Tag>,
    },
    {
      title: 'Ngay',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tac',
      key: 'actions',
      width: 170,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => viewDetail(r.id)}>
            Chi tiet
          </Button>
          {canCancel && r.status === 'COMPLETED' && (
            <Popconfirm title="Huy don va hoan kho?" onConfirm={() => cancel(r.id)}>
              <Button size="small" danger>
                Huy
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Ban hang
        </Typography.Title>
        {canSell && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Tao don hang
          </Button>
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />

      {/* Modal tao don */}
      <Modal
        title="Tao don hang moi"
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        okText="Thanh toan"
        cancelText="Huy"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="customerId" label="Khach hang" style={{ width: 320 }}>
              <Select
                allowClear
                showSearch
                placeholder="Khach le"
                optionFilterProp="label"
                options={customers.map((c) => ({ value: c.id, label: c.fullName }))}
              />
            </Form.Item>
            <Form.Item name="paymentMethod" label="Thanh toan" rules={[{ required: true }]}>
              <Select
                style={{ width: 160 }}
                options={[
                  { value: 'CASH', label: 'Tien mat' },
                  { value: 'CARD', label: 'The' },
                  { value: 'TRANSFER', label: 'Chuyen khoan' },
                ]}
              />
            </Form.Item>
          </Space>

          <Divider>San pham</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...rest}
                      name={[name, 'productId']}
                      rules={[{ required: true, message: 'Chon SP' }]}
                      style={{ width: 360 }}
                    >
                      <Select
                        showSearch
                        placeholder="San pham"
                        optionFilterProp="label"
                        options={products.map((p) => ({
                          value: p.id,
                          label: `${p.name} - ${formatVND(p.salePrice)} (ton: ${p.stockQuantity})`,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'SL' }]}
                    >
                      <InputNumber min={1} placeholder="So luong" />
                    </Form.Item>
                    {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                  </Space>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                  Them san pham
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item name="discount" label="Giam gia (đ)" style={{ marginTop: 16 }}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chu">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiet */}
      <Modal
        title={`Chi tiet don ${detail?.code ?? ''}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={<Button onClick={() => setDetail(null)}>Dong</Button>}
        width={640}
      >
        {detail && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Khach hang">
                {detail.customer?.fullName ?? 'Khach le'}
              </Descriptions.Item>
              <Descriptions.Item label="Thu ngan">
                {detail.employee?.fullName ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toan">{payLabel[detail.paymentMethod]}</Descriptions.Item>
              <Descriptions.Item label="Trang thai">
                <Tag color={statusTag[detail.status].color}>{statusTag[detail.status].label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giam gia">{formatVND(detail.discount)}</Descriptions.Item>
              <Descriptions.Item label="Thanh tien">{formatVND(detail.finalAmount)}</Descriptions.Item>
            </Descriptions>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={detail.items ?? []}
              columns={[
                { title: 'San pham', key: 'p', render: (_, r: OrderItem) => r.product?.name ?? '—' },
                { title: 'SL', dataIndex: 'quantity', key: 'q' },
                { title: 'Don gia', dataIndex: 'unitPrice', key: 'u', render: (v) => formatVND(v) },
                { title: 'Thanh tien', dataIndex: 'subtotal', key: 's', render: (v) => formatVND(v) },
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
