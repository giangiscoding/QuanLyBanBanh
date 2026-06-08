import { useEffect, useState } from 'react';
import { Table, Typography, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { api, type ApiResponse } from '@/services/api';

// Trang mau: goi API GET /products va hien thi bang.
// Cac module khac lam tuong tu.

interface Product {
  id: number;
  sku: string;
  name: string;
  salePrice: string;
  stockQuantity: number;
  isActive: boolean;
  category?: { id: number; name: string } | null;
}

const columns: ColumnsType<Product> = [
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: 'Ten san pham', dataIndex: 'name', key: 'name' },
  { title: 'Danh muc', key: 'category', render: (_, r) => r.category?.name ?? '—' },
  {
    title: 'Gia ban',
    dataIndex: 'salePrice',
    key: 'salePrice',
    render: (v: string) => `${Number(v).toLocaleString('vi-VN')} đ`,
  },
  { title: 'Ton kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
  {
    title: 'Trang thai',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (active: boolean) =>
      active ? <Tag color="green">Dang ban</Tag> : <Tag color="red">Ngung</Tag>,
  },
];

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiResponse<Product[]>>('/products')
      .then((res) => setData(res.data.data))
      .catch(() => message.error('Khong tai duoc danh sach san pham'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Typography.Title level={3}>San pham</Typography.Title>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
    </div>
  );
}
