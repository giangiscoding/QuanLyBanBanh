import { useEffect, useState } from 'react';
import { Table, Typography, Button, Input, Space, Tag, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api, type ApiResponse } from '@/services/api';

// Định nghĩa cấu trúc dữ liệu chuẩn xác theo Backend 
interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
}

export default function SuppliersPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // State cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // Hàm gọi API lấy danh sách [cite: 3, 7]
  const fetchSuppliers = async (search = '') => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Supplier[]>>('/suppliers', {
        params: { search, limit: 100 } // Tạm lấy 100 dòng cho nhanh
      });
      setData(res.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Xử lý Thêm / Cập nhật [cite: 4, 8, 9]
  const handleSave = async (values: any) => {
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, values);
        message.success('Cập nhật thành công');
      } else {
        await api.post('/suppliers', values);
        message.success('Thêm nhà cung cấp thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchSuppliers(searchText);
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng kiểm tra lại');
    }
  };

  // Xử lý Xóa (Xóa mềm) [cite: 4, 10]
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/suppliers/${id}`);
      message.success('Đã ngừng hợp tác với nhà cung cấp này');
      fetchSuppliers(searchText);
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  const openEditModal = (record: Supplier) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const columns: ColumnsType<Supplier> = [
    { title: 'Tên đối tác', dataIndex: 'name', key: 'name', width: '20%' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', render: (t) => t || '—' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (t) => t || '—' },
    { title: 'Mã số thuế', dataIndex: 'taxCode', key: 'taxCode', render: (t) => t || '—' },
  
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm 
            title="Ngừng hợp tác với nhà cung cấp này?" 
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý" 
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Nhà cung cấp</Typography.Title>
        <Space>
          <Input 
            placeholder="Tìm theo tên, email, sđt..." 
            prefix={<SearchOutlined />} 
            allowClear
            onChange={(e) => {
              setSearchText(e.target.value);
              fetchSuppliers(e.target.value);
            }}
            style={{ width: 250 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Thêm mới
          </Button>
        </Space>
      </Space>

      <Table 
        rowKey="id" 
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        pagination={{ pageSize: 10 }} 
      />

      {/* Cửa sổ bật lên để nhập thông tin */}
      <Modal
        title={editingId ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên nhà cung cấp" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="VD: Công ty TNHH Bánh Kẹo Á Châu" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="VD: 0987654321" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input placeholder="VD: contact@achau.com" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ chi tiết..." />
          </Form.Item>
          <Form.Item name="taxCode" label="Mã số thuế">
            <Input placeholder="VD: 0101234567" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}