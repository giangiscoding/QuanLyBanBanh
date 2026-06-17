import { useCallback, useEffect, useState } from 'react';
import { Card, Col, DatePicker, Row, Statistic, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { api, type ApiResponse } from '@/services/api';
import { getErrorMessage, formatVND } from '@/services/error';

const { RangePicker } = DatePicker;

interface Revenue {
  orderCount: number;
  totalAmount: number;
  discount: number;
  revenue: number;
  cogs: number;
  profit: number;
}

interface TopProduct {
  product: { id: number; sku: string; name: string } | null;
  quantitySold: number;
  revenue: number;
}

interface InventoryReport {
  totalProducts: number;
  stockValue: number;
  retailValue: number;
  lowStockCount: number;
  lowStock: Array<{ id: number; sku: string; name: string; stockQuantity: number; minStock: number }>;
}

export default function ReportsPage() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs().endOf('day')]);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [inventory, setInventory] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    const params = { from: range[0].toISOString(), to: range[1].toISOString() };
    const qs = `from=${encodeURIComponent(params.from)}&to=${encodeURIComponent(params.to)}`;
    setLoading(true);
    Promise.all([
      api.get<ApiResponse<Revenue>>(`/reports/revenue?${qs}`),
      api.get<ApiResponse<TopProduct[]>>(`/reports/top-products?limit=10&${qs}`),
      api.get<ApiResponse<InventoryReport>>('/reports/inventory'),
    ])
      .then(([rev, tp, inv]) => {
        setRevenue(rev.data.data);
        setTop(tp.data.data);
        setInventory(inv.data.data);
      })
      .catch((e) => message.error(getErrorMessage(e, 'Khong tai duoc bao cao')))
      .finally(() => setLoading(false));
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const topColumns: ColumnsType<TopProduct> = [
    { title: 'San pham', key: 'p', render: (_, r) => r.product?.name ?? '—' },
    { title: 'SKU', key: 'sku', render: (_, r) => r.product?.sku ?? '—' },
    { title: 'So luong ban', dataIndex: 'quantitySold', key: 'q' },
    { title: 'Doanh thu', dataIndex: 'revenue', key: 'rev', render: (v) => formatVND(v) },
  ];

  const lowColumns: ColumnsType<InventoryReport['lowStock'][number]> = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'San pham', dataIndex: 'name', key: 'name' },
    { title: 'Ton kho', dataIndex: 'stockQuantity', key: 'q' },
    { title: 'Nguong toi thieu', dataIndex: 'minStock', key: 'm' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Bao cao
        </Typography.Title>
        <RangePicker
          value={range}
          format="DD/MM/YYYY"
          allowClear={false}
          onChange={(v) => v && v[0] && v[1] && setRange([v[0], v[1]])}
        />
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card loading={loading}>
            <Statistic title="So don hang" value={revenue?.orderCount ?? 0} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Doanh thu" value={revenue?.revenue ?? 0} suffix="đ" groupSeparator="," />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Gia von (COGS)" value={revenue?.cogs ?? 0} suffix="đ" groupSeparator="," />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Loi nhuan"
              value={revenue?.profit ?? 0}
              suffix="đ"
              groupSeparator=","
              valueStyle={{ color: (revenue?.profit ?? 0) >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="So san pham dang ban" value={inventory?.totalProducts ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="Gia tri ton (theo gia von)" value={inventory?.stockValue ?? 0} suffix="đ" groupSeparator="," />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic
              title="San pham sap het"
              value={inventory?.lowStockCount ?? 0}
              valueStyle={{ color: (inventory?.lowStockCount ?? 0) > 0 ? '#cf1322' : undefined }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="Top san pham ban chay" loading={loading} style={{ marginBottom: 16 }}>
            <Table rowKey={(r) => r.product?.id ?? Math.random()} size="small" pagination={false} columns={topColumns} dataSource={top} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="San pham sap het hang" loading={loading} style={{ marginBottom: 16 }}>
            <Table rowKey="id" size="small" pagination={false} columns={lowColumns} dataSource={inventory?.lowStock ?? []} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
