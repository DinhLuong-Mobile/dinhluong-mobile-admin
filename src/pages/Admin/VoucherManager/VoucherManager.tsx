import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Space, Typography, Input, Tag, 
    Popconfirm, Tooltip, Modal, Form, Select, InputNumber, DatePicker 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { useVoucherManager } from './useVoucherManager';
import type { Voucher } from '../../../types/voucher.types';

const { Title, Text } = Typography;
const { Option } = Select;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const VoucherManager: React.FC = () => {
    const { vouchers, loading, saving, fetchVouchers, saveVoucher, deleteVoucher } = useVoucherManager();
    const [searchText, setSearchText] = useState<string>('');

    // Modal UI States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    // --- XỬ LÝ MỞ MODAL ---
    const openModal = (voucher: Voucher | null = null) => {
        setEditingVoucher(voucher);
        if (voucher) {
            form.setFieldsValue({
                ...voucher,
                expiryDate: dayjs(voucher.expiryDate)
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ discountType: 'FIXED', usedCount: 0 });
        }
        setIsModalVisible(true);
    };

    // --- XỬ LÝ LƯU (SUBMIT FORM) ---
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            const payload = {
                ...values,
                expiryDate: values.expiryDate.format('YYYY-MM-DDTHH:mm:ss')
            };

            const isSuccess = await saveVoucher(editingVoucher?.id || null, payload);
            
            if (isSuccess) {
                setIsModalVisible(false);
                fetchVouchers(searchText); // Reload lại danh sách sau khi lưu
            }
        } catch (error) {
            console.log('Validate Failed:', error);
        }
    };

    const handleDelete = async (id: number) => {
        const isSuccess = await deleteVoucher(id);
        if (isSuccess) {
            fetchVouchers(searchText);
        }
    };

    // --- CỘT BẢNG ---
    const columns = [
        { title: 'Mã Code', dataIndex: 'code', key: 'code', render: (text: string) => <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>{text}</Tag> },
        { 
            title: 'Mức giảm', key: 'discount', 
            render: (_: any, record: Voucher) => (
                <Text strong type="danger">
                    {record.discountType === 'PERCENT' ? `${record.discount}%` : formatCurrency(record.discount)}
                </Text>
            )
        },
        { title: 'Đơn tối thiểu', dataIndex: 'minOrderAmount', key: 'minOrderAmount', render: (amount: number) => <Text>{formatCurrency(amount)}</Text> },
        { 
            title: 'Đã dùng / Tổng', key: 'usage', align: 'center' as const,
            render: (_: any, record: Voucher) => {
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
            render: (_: any, record: Voucher) => (
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