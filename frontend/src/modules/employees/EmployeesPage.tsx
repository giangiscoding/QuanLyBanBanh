import { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { api, type ApiResponse } from '@/services/api';
import { getErrorMessage, formatVND } from '@/services/error';
import { useAuth } from '@/store/AuthContext';

type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';

interface Employee {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  position: string | null;
  salary: string | null;
  status: EmployeeStatus;
  gender: Gender | null;
  dateOfBirth: string | null;
  citizenId: string | null;
  emergencyContact: string | null;
  hiredAt: string | null;
  user?: { id: number; username: string; role: string; email?: string | null } | null;
}

const GENDER_LABEL: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nu',
  OTHER: 'Khac',
};

interface PerfPeriod {
  orders: number;
  revenue: number;
}
interface EmployeeDetail {
  employee: Employee;
  attendance: {
    month: number;
    quarter: number;
    year: number;
    breakdownThisMonth: { present: number; halfDay: number; leave: number; absent: number };
  };
  performance: { month: PerfPeriod; quarter: PerfPeriod; year: PerfPeriod };
  rating: string;
}

const STATUS: Record<EmployeeStatus, { color: string; label: string }> = {
  ACTIVE: { color: 'green', label: 'Dang lam viec' },
  ON_LEAVE: { color: 'orange', label: 'Nghi phep' },
  INACTIVE: { color: 'red', label: 'Da nghi viec' },
};

const RATING_COLOR: Record<string, string> = {
  'Xuat sac': 'green',
  Tot: 'blue',
  Kha: 'gold',
  'Can cai thien': 'red',
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  const [detail, setDetail] = useState<EmployeeDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Employee[]>>('/employees')
      .then((res) => setData(res.data.data))
      .catch((e) => message.error(getErrorMessage(e, 'Khong tai duoc nhan vien')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: Employee) => {
    setEditing(record);
    form.setFieldsValue({
      fullName: record.fullName,
      phone: record.phone,
      email: record.email,
      position: record.position,
      salary: record.salary ? Number(record.salary) : undefined,
      status: record.status,
      gender: record.gender ?? undefined,
      citizenId: record.citizenId,
      address: record.address,
      emergencyContact: record.emergencyContact,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : undefined,
      hiredAt: record.hiredAt ? dayjs(record.hiredAt) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).toISOString() : undefined,
      hiredAt: values.hiredAt ? dayjs(values.hiredAt).toISOString() : undefined,
    };
    try {
      if (editing) {
        await api.put(`/employees/${editing.id}`, payload);
        message.success('Cap nhat thanh cong');
      } else {
        await api.post('/employees', payload);
        message.success('Them nhan vien thanh cong');
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const resign = async (id: number) => {
    try {
      await api.delete(`/employees/${id}`);
      message.success('Da cho nhan vien nghi viec (van luu ho so)');
      load();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const openDetail = async (id: number) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await api.get<ApiResponse<EmployeeDetail>>(`/employees/${id}/detail`);
      setDetail(res.data.data);
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<Employee> = [
    { title: 'Ho ten', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Chuc vu', dataIndex: 'position', key: 'position', render: (v) => v ?? '—' },
    { title: 'Dien thoai', dataIndex: 'phone', key: 'phone', render: (v) => v ?? '—' },
    { title: 'Luong', dataIndex: 'salary', key: 'salary', render: (v) => (v ? formatVND(v) : '—') },
    {
      title: 'Trang thai',
      dataIndex: 'status',
      key: 'status',
      render: (s: EmployeeStatus) => <Tag color={STATUS[s].color}>{STATUS[s].label}</Tag>,
    },
    {
      title: 'Tai khoan',
      key: 'user',
      render: (_, r) => (r.user ? <Tag color="blue">{r.user.username} ({r.user.role})</Tag> : '—'),
    },
    {
      title: 'Thao tac',
      key: 'actions',
      width: 230,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openDetail(r.id)}>
            Chi tiet
          </Button>
          {canManage && (
            <Button size="small" onClick={() => openEdit(r)}>
              Sua
            </Button>
          )}
          {isAdmin && r.status !== 'INACTIVE' && (
            <Popconfirm title="Cho nhan vien nay nghi viec?" onConfirm={() => resign(r.id)}>
              <Button size="small" danger>
                Nghi viec
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
          Nhan vien
        </Typography.Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Them nhan vien
          </Button>
        )}
      </div>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />

      {/* Modal them/sua */}
      <Modal
        title={editing ? 'Sua nhan vien' : 'Them nhan vien'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        okText="Luu"
        cancelText="Huy"
        width={620}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="Ho ten" rules={[{ required: true, message: 'Nhap ho ten' }]}>
            <Input />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="gender" label="Gioi tinh" style={{ width: 130 }}>
              <Select
                allowClear
                options={[
                  { value: 'MALE', label: 'Nam' },
                  { value: 'FEMALE', label: 'Nu' },
                  { value: 'OTHER', label: 'Khac' },
                ]}
              />
            </Form.Item>
            <Form.Item name="dateOfBirth" label="Ngay sinh" style={{ width: 170 }}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="citizenId"
              label="So CCCD"
              style={{ width: 180 }}
              rules={[{ pattern: /^\d{9,12}$/, message: '9-12 chu so' }]}
            >
              <Input placeholder="12 chu so" />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="phone" label="Dien thoai" style={{ width: 200 }}>
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              style={{ width: 260 }}
              rules={[{ type: 'email', message: 'Email khong hop le' }]}
            >
              <Input />
            </Form.Item>
          </Space>

          <Form.Item name="address" label="Dia chi">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="emergencyContact" label="Lien he khan cap">
            <Input placeholder="Ho ten (quan he) - SDT" />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="position" label="Chuc vu" style={{ width: 200 }}>
              <Input placeholder="VD: Thu ngan..." />
            </Form.Item>
            <Form.Item name="salary" label="Luong" style={{ width: 160 }}>
              <InputNumber min={0} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            <Form.Item name="status" label="Trang thai" style={{ width: 150 }}>
              <Select
                options={[
                  { value: 'ACTIVE', label: 'Dang lam viec' },
                  { value: 'ON_LEAVE', label: 'Nghi phep' },
                  { value: 'INACTIVE', label: 'Da nghi viec' },
                ]}
              />
            </Form.Item>
          </Space>

          <Form.Item name="hiredAt" label="Ngay vao lam">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer chi tiet */}
      <Drawer
        title={detail ? `Ho so: ${detail.employee.fullName}` : 'Thong tin nhan vien'}
        width={560}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        loading={detailLoading}
      >
        {detail && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Ho ten">{detail.employee.fullName}</Descriptions.Item>
              <Descriptions.Item label="Gioi tinh">
                {detail.employee.gender ? GENDER_LABEL[detail.employee.gender] : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngay sinh">
                {detail.employee.dateOfBirth
                  ? dayjs(detail.employee.dateOfBirth).format('DD/MM/YYYY')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="So CCCD">{detail.employee.citizenId ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Chuc vu">{detail.employee.position ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Dien thoai">{detail.employee.phone ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{detail.employee.email ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Dia chi">{detail.employee.address ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Lien he khan cap">
                {detail.employee.emergencyContact ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Luong">
                {detail.employee.salary ? formatVND(detail.employee.salary) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngay vao lam">
                {detail.employee.hiredAt ? dayjs(detail.employee.hiredAt).format('DD/MM/YYYY') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Tai khoan">
                {detail.employee.user
                  ? `${detail.employee.user.username} (${detail.employee.user.role})`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Trang thai">
                <Tag color={STATUS[detail.employee.status].color}>
                  {STATUS[detail.employee.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Danh gia">
                <Tag color={RATING_COLOR[detail.rating] ?? 'default'}>{detail.rating}</Tag>
                <Typography.Text type="secondary"> (theo so cong thang nay)</Typography.Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Cham cong (so cong di lam)</Divider>
            <Space size="large">
              <Statistic title="Thang nay" value={detail.attendance.month} suffix="cong" />
              <Statistic title="Quy nay" value={detail.attendance.quarter} suffix="cong" />
              <Statistic title="Nam nay" value={detail.attendance.year} suffix="cong" />
            </Space>
            <div style={{ marginTop: 12 }}>
              <Typography.Text type="secondary">Chi tiet thang nay: </Typography.Text>
              <Tag color="green">Di lam {detail.attendance.breakdownThisMonth.present}</Tag>
              <Tag color="cyan">Nua ngay {detail.attendance.breakdownThisMonth.halfDay}</Tag>
              <Tag color="orange">Nghi phep {detail.attendance.breakdownThisMonth.leave}</Tag>
              <Tag color="red">Vang {detail.attendance.breakdownThisMonth.absent}</Tag>
            </div>

            <Divider orientation="left">Hieu suat ban hang (don da xu ly)</Divider>
            <Table
              rowKey="ky"
              size="small"
              pagination={false}
              dataSource={[
                { ky: 'Thang nay', ...detail.performance.month },
                { ky: 'Quy nay', ...detail.performance.quarter },
                { ky: 'Nam nay', ...detail.performance.year },
              ]}
              columns={[
                { title: 'Ky', dataIndex: 'ky', key: 'ky' },
                { title: 'So don', dataIndex: 'orders', key: 'orders' },
                { title: 'Doanh thu phu trach', dataIndex: 'revenue', key: 'revenue', render: (v) => formatVND(v) },
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
