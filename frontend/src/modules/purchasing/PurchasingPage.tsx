import { useEffect, useState } from 'react';
import { Table, Typography, Space, Tag, Button, Modal, Form, Select, InputNumber, message, Popconfirm, Drawer, Radio } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { api } from '@/services/api';

export default function PurchasingPage() {
  const [data, setData] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      
      const res = await api.get('/purchasing', { params });
      setData(res.data?.data || []);

      const supRes = await api.get('/suppliers');
      setSuppliers(supRes.data?.data || []);

      const prodRes = await api.get('/products', { params: { limit: 1000 } });
      setProducts(prodRes.data?.data || []);
    } catch (error) {
      message.error('Không tải được dữ liệu nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const handleCreate = async (values: any) => {
    try {
      const payload = {
        supplierId: values.supplierId,
        status: values.status || 'RECEIVED',
        items: [
          {
            productId: values.productId,
            quantity: values.quantity,
            unitCost: values.price,
          }
        ]
      };

      await api.post('/purchasing', payload);
      const statusText = values.status === 'PENDING' ? 'chờ xác nhận' : 'đã cộng vào Kho';
      message.success(`Tạo phiếu nhập thành công! Phiếu ${statusText}.`);
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Lỗi hệ thống khi tạo phiếu nhập. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const handleReceive = async (id: number) => {
    try {
      await api.put(`/purchasing/${id}/receive`);
      message.success('Xác nhận đã nhận hàng thành công!');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi xác nhận nhận hàng');
    }
  };

  const showDetail = (record: any) => {
    setSelectedOrder(record);
    setDetailDrawerOpen(true);
  };

  const columns: ColumnsType<any> = [
    { title: 'Mã Phiếu', dataIndex: 'code', key: 'code', render: (t) => <b>{t}</b> },
    { title: 'Nhà cung cấp', dataIndex: ['supplier', 'name'], key: 'supplier', render: (t) => t || '—' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (val) => `${(val || 0).toLocaleString()} đ` },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'PENDING' ? 'orange' : status === 'RECEIVED' ? 'green' : 'red';
        const text = status === 'PENDING' ? 'Chờ nhận' : status === 'RECEIVED' ? 'Đã nhập kho' : 'Hủy';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (t) => new Date(t).toLocaleString('vi-VN') },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => showDetail(record)}>Chi tiết</Button>
          {record.status === 'PENDING' && (
            <Popconfirm
              title="Xác nhận đã nhận hàng?"
              onConfirm={() => handleReceive(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="primary" size="small">Nhận hàng</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Quản lý Nhập hàng</Typography.Title>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>+ Tạo Phiếu Nhập mới</Button>
      </Space>

      {/* Filter Status */}
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          allowClear
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: 'Chờ nhận hàng', value: 'PENDING' },
            { label: 'Đã nhập kho', value: 'RECEIVED' },
            { label: 'Hủy', value: 'CANCELLED' },
          ]}
        />
      </div>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 10 }} />

      <Modal 
        title="Tạo Phiếu Nhập hàng mới" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()} 
        okText="Tạo phiếu" 
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ status: 'RECEIVED' }}>
          <Form.Item name="supplierId" label="Chọn Nhà cung cấp" rules={[{ required: true, message: 'Bắt buộc chọn!' }]}>
            <Select placeholder="-- Chọn đối tác cung cấp --" options={suppliers.map(s => ({ label: s.name, value: s.id }))} />
          </Form.Item>
          
          <Form.Item name="productId" label="Chọn Sản phẩm" rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}>
            <Select placeholder="-- Chọn sản phẩm --" options={products.map(p => ({ label: `${p.name} (SKU: ${p.sku})`, value: p.id }))} />
          </Form.Item>
          
          <Form.Item name="quantity" label="Số lượng nhập" rules={[{ required: true, message: 'Nhập số lượng!' }]}>
            <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 100" />
          </Form.Item>
          
          <Form.Item name="price" label="Đơn giá nhập (VNĐ)" rules={[{ required: true, message: 'Nhập đơn giá!' }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={1000} placeholder="VD: 15000" />
          </Form.Item>

          <Form.Item name="status" label="Thời gian nhập kho" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="RECEIVED">Nhập kho ngay</Radio>
              <Radio value="PENDING">Chờ xác nhận sau</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết Phiếu Nhập"
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
        width={500}
      >
        {selectedOrder && (
          <div>
            <p><b>Mã phiếu:</b> {selectedOrder.code}</p>
            <p><b>Nhà cung cấp:</b> {selectedOrder.supplier?.name || '—'}</p>
            <p><b>Tổng tiền:</b> {(selectedOrder.totalAmount || 0).toLocaleString()} đ</p>
            <p><b>Trạng thái:</b> {selectedOrder.status === 'PENDING' ? 'Chờ nhận' : selectedOrder.status === 'RECEIVED' ? 'Đã nhập kho' : 'Hủy'}</p>
            <p><b>Thời gian:</b> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
            <p><b>Ghi chú:</b> {selectedOrder.note || '—'}</p>
            <h4>Chi tiết sản phẩm:</h4>
            <Table
              dataSource={selectedOrder.items || []}
              columns={[
                { title: 'Sản phẩm', dataIndex: ['product', 'name'], key: 'name' },
                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                { title: 'Đơn giá', dataIndex: 'unitCost', key: 'unitCost', render: (v) => `${v?.toLocaleString() || 0} đ` },
                { title: 'Tổng', dataIndex: 'subtotal', key: 'subtotal', render: (v) => `${v?.toLocaleString() || 0} đ` },
              ]}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}