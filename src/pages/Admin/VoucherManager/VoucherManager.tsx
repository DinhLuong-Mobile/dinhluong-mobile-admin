import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Space, Typography, Input, Tag, 
    message, Popconfirm, Tooltip, Modal, Form, Select, InputNumber, DatePicker 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface VoucherResponse {
    id: number;
    code: string;
    discount: number;
    discountType: 'PERCENT' | 'FIXED';
    minOrderAmount: number;
    usageLimit: number;
    usedCount: number;
    expiryDate: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const VoucherManager: React.FC = () => {
    const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');

    // Modal States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<VoucherResponse | null>(null);
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    // --- FETCH DATA ---
    const fetchVouchers = async (keyword = '') => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/admin/vouchers?keyword=${keyword}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await response.json();
            if (response.ok && json.status === 'success') {
                setVouchers(json.data);
            } else { message.error(json.message); }
        } catch (error) { message.error("Lỗi khi tải dữ liệu"); } finally { setLoading(false); }
    };

    useEffect(() => { fetchVouchers(); }, []);

    // --- THÊM / SỬA (MỞ MODAL) ---
    const openModal = (voucher: VoucherResponse | null = null) => {
        setEditingVoucher(voucher);
        if (voucher) {
            // Đẩy dữ liệu cũ vào Form
            form.setFieldsValue({
                ...voucher,
                expiryDate: dayjs(voucher.expiryDate)
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ discountType: 'FIXED', usedCount: 0 }); // Giá trị mặc định
        }
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            
            // Format ngày giờ gửi xuống BE
            const payload = {
                ...values,
                expiryDate: values.expiryDate.format('YYYY-MM-DDTHH:mm:ss')
            };

            const token = getAuthToken();
            const url = editingVoucher 
                ? `http://localhost:8080/api/admin/vouchers/${editingVoucher.id}` 
                : `http://localhost:8080/api/admin/vouchers`;
            const method = editingVoucher ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await response.json();
            if (response.ok && json.status === 'success') {
                message.success(editingVoucher ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                setIsModalVisible(false);
                fetchVouchers(searchText); // Reload danh sách
            } else { message.error(json.message); }
        } catch (error) { console.log('Validate Failed:', error); } finally { setSaving(false); }
    };

    // --- XÓA ---
    const handleDelete = async (id: number) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/admin/vouchers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await response.json();
            if (response.ok && json.status === 'success') {
                message.success("Xóa thành công!");
                fetchVouchers(searchText);
            } else { message.error(json.message); }
        } catch (error) { message.error("Lỗi kết nối"); }
    };

    // --- CỘT BẢNG ---
    const columns = [
        { title: 'Mã Code', dataIndex: 'code', key: 'code', render: (text: string) => <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>{text}</Tag> },
        { 
            title: 'Mức giảm', key: 'discount', 
            render: (_: any, record: VoucherResponse) => (
                <Text strong type="danger">
                    {record.discountType === 'PERCENT' ? `${record.discount}%` : formatCurrency(record.discount)}
                </Text>
            )
        },
        { title: 'Đơn tối thiểu', dataIndex: 'minOrderAmount', key: 'minOrderAmount', render: (amount: number) => <Text>{formatCurrency(amount)}</Text> },
        { 
            title: 'Đã dùng / Tổng', key: 'usage', align: 'center' as const,
            render: (_: any, record: VoucherResponse) => {
                const isFull = record.usedCount >= record.usageLimit;
                return (
                    <Tag color={isFull ? 'red' : 'green'}>
                        {record.usedCount} / {record.usageLimit}
                    </Tag>
                );
            }
        },
        { 
            title: 'Hạn sử dụng', dataIndex: 'expiryDate', key: 'expiryDate', 
            render: (date: string) => {
                const isExpired = dayjs().isAfter(dayjs(date));
                return <Text type={isExpired ? 'danger' : 'secondary'} delete={isExpired}>{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>;
            }
        },
        { 
            title: 'Thao tác', key: 'action', 
            render: (_: any, record: VoucherResponse) => (
                <Space>
                    <Tooltip title="Sửa"><Button size="small" icon={<EditOutlined style={{color: '#1890ff'}}/>} onClick={() => openModal(record)} /></Tooltip>
                    <Popconfirm title="Bạn có chắc muốn xóa mã này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                        <Tooltip title="Xóa"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
                    </Popconfirm>
                </Space>
            ) 
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0 }}>Quản lý Mã giảm giá (Vouchers)</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm Mã mới</Button>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Input.Search 
                    placeholder="Nhập mã code để tìm kiếm..." 
                    allowClear 
                    enterButton={<SearchOutlined />}
                    onSearch={(val) => { setSearchText(val); fetchVouchers(val); }}
                    style={{ width: 300 }} 
                />
            </div>

            <Table columns={columns} dataSource={vouchers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

            {/* MODAL THÊM / SỬA */}
            <Modal
                title={editingVoucher ? "Cập nhật Mã giảm giá" : "Thêm mới Mã giảm giá"}
                open={isModalVisible}
                onOk={handleModalOk}
                confirmLoading={saving}
                onCancel={() => setIsModalVisible(false)}
                okText="Lưu lại"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" name="voucherForm">
                    <Form.Item name="code" label="Mã Voucher (Code)" rules={[{ required: true, message: 'Vui lòng nhập mã code!' }]}>
                        <Input placeholder="VD: TET2024, SIEUSALE..." style={{ textTransform: 'uppercase' }} />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="discountType" label="Loại giảm giá" style={{ flex: 1 }}>
                            <Select>
                                <Option value="FIXED">Giảm tiền mặt (VNĐ)</Option>
                                <Option value="PERCENT">Giảm phần trăm (%)</Option>
                            </Select>
                        </Form.Item>
                        
                        <Form.Item name="discount" label="Mức giảm" style={{ flex: 1 }} rules={[{ required: true, message: 'Vui lòng nhập mức giảm!' }]}>
                            <InputNumber style={{ width: '100%' }} min={1} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </div>

                    <Form.Item name="minOrderAmount" label="Giá trị đơn hàng tối thiểu (VNĐ)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="usageLimit" label="Số lượng phát hành" style={{ flex: 1 }} rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>

                        <Form.Item name="expiryDate" label="Ngày hết hạn" style={{ flex: 1 }} rules={[{ required: true, message: 'Chọn ngày hết hạn!' }]}>
                            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default VoucherManager;