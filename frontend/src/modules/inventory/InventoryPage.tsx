import { useEffect, useState } from 'react';
import { Table, Typography, Space, Tag, Button, Modal, Form, InputNumber, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { api, type ApiResponse } from '@/services/api';

interface Product {
  id: number;
  sku: string;
  name: string;
}

interface StockMovement {
  id: number;
  product: Product;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  createdAt: string;
  note: string;
}

export default function InventoryPage() {
  const [data, setData] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Gọi API /inventory/movements cậu viết đêm qua để lấy lịch sử kho
  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<StockMovement[]>>('/inventory/movements');
      setData(res.data.data);
    } catch (error) {
      message.error('Không tải được lịch sử biến động kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // Gọi API /inventory/adjust để xử lý kiểm kê cân bằng kho
  const handleAdjust = async (values: any) => {
    try {
      await api.post('/inventory/adjust', values);
      message.success('Điều chỉnh tồn kho thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchMovements();
    } catch (error) {
      message.error('Lỗi hệ thống khi điều chỉnh tồn kho');
    }
  };

  const columns: ColumnsType<StockMovement> = [
    { title: 'Mã SP', dataIndex: ['product', 'sku'], key: 'sku' },
    { title: 'Tên Sản phẩm', dataIndex: ['product', 'name'], key: 'name' },
    {
      title: 'Loại biến động',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        if (type === 'IN') return <Tag color="green">Nhập kho (+)</Tag>;
        if (type === 'OUT') return <Tag color="red">Xuất kho (-)</Tag>;
        return <Tag color="orange">Kiểm kê</Tag>;
      },
    },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', render: (t) => t || '—' },
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (t) => new Date(t).toLocaleString('vi-VN') },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Biến động Kho hàng</Typography.Title>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>Kiểm kê & Điều chỉnh</Button>
      </Space>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title="Điều chỉnh tồn kho thực tế"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu điều chỉnh"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleAdjust}>
          <Form.Item name="productId" label="ID Sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập ID sản phẩm!' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="VD: 1, 2, 3..." />
          </Form.Item>
          <Form.Item name="actualQuantity" label="Số lượng đếm được thực tế" rules={[{ required: true, message: 'Nhập số lượng thực tế!' }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 50" />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú (Lý do lệch)">
            <Input.TextArea rows={2} placeholder="VD: Hàng bị hỏng, hết hạn sử dụng..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}