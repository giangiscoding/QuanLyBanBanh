import { useEffect, useState } from 'react';
import { Table, Typography, Space, Tag, Button, Modal, Form, Select, InputNumber, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { api } from '@/services/api';

export default function PurchasingPage() {
  const [data, setData] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy lịch sử phiếu nhập hàng
      const res = await api.get('/purchasing');
      setData(res.data?.data || []);

      // 2. Lấy danh sách Nhà cung cấp (từ Module 1) để đổ vào form chọn
      const supRes = await api.get('/suppliers');
      setSuppliers(supRes.data?.data || []);
    } catch (error) {
      message.error('Không tải được dữ liệu nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      // Gọi API tạo phiếu nhập, Backend của cậu sẽ tự động cộng số lượng vào Kho
      await api.post('/purchasing/orders', values);
      message.success('Tạo phiếu nhập thành công! Hàng đã tự động cộng vào Kho.');
      setIsModalOpen(false);
      form.resetFields();
      fetchData(); // Cập nhật lại bảng
    } catch (error) {
      message.error('Lỗi hệ thống khi tạo phiếu nhập');
    }
  };

  const columns: ColumnsType<any> = [
    { title: 'Mã Phiếu', dataIndex: 'code', key: 'code', render: (t) => <b>{t || 'PN-NEW'}</b> },
    { title: 'Nhà cung cấp', dataIndex: ['supplier', 'name'], key: 'supplier', render: (t) => t || 'Đối tác lưu động' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (val) => `${(val || 0).toLocaleString()} đ` },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: () => <Tag color="blue">Đã nhập kho</Tag> },
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (t) => t ? new Date(t).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN') },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Quản lý Nhập hàng</Typography.Title>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>+ Tạo Phiếu Nhập mới</Button>
      </Space>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 10 }} />

      <Modal 
        title="Tạo Phiếu Nhập hàng mới" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()} 
        okText="Tạo phiếu & Nhập kho" 
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="supplierId" label="Chọn Nhà cung cấp (Từ Module 1)" rules={[{ required: true, message: 'Bắt buộc chọn!' }]}>
            <Select placeholder="-- Chọn đối tác cung cấp --">
              {suppliers.map(s => (
                <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="productId" label="ID Sản phẩm cần nhập" rules={[{ required: true, message: 'Nhập ID sản phẩm!' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="VD: 1, 2, 3..." />
          </Form.Item>
          
          <Form.Item name="quantity" label="Số lượng nhập" rules={[{ required: true, message: 'Nhập số lượng!' }]}>
            <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 100" />
          </Form.Item>
          
          <Form.Item name="price" label="Đơn giá nhập (VNĐ)" rules={[{ required: true, message: 'Nhập đơn giá!' }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={1000} placeholder="VD: 15000" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}