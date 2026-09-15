import React from 'react';
import {
    Table, Tag, Button, Space, Select, Typography, Card, Input, Tooltip
} from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { usePaymentManager } from './usePaymentManager'; 
import type { PaymentResponse } from '../../../types/payment.types';
import { ADMIN_ROUTES } from '../../../constants/routes';

const { Title, Text } = Typography;
const { Option } = Select;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const PaymentManager: React.FC = () => {
    const navigate = useNavigate();

    const {
        payments, loading,
        filterMethod, setFilterMethod,
        filterStatus, setFilterStatus, setSearchText,
        fetchPayments, handleConfirmRefund
    } = usePaymentManager();

    const columns = [
        {
            title: 'Mã GD', dataIndex: 'id', key: 'id',
            render: (text: number) => <Text type="secondary">#{text}</Text>
        },
        {
            title: 'Mã Đơn Hàng', dataIndex: 'orderId', key: 'orderId',
            render: (orderId: number, record: PaymentResponse) => (
                <Space direction="vertical" size={0}>
                    <Text 
                        strong 
                        style={{ color: '#1890ff', cursor: 'pointer' }} 
                        onClick={() => navigate(`${ADMIN_ROUTES.ADMIN_ROOT}/${ADMIN_ROUTES.ORDERS}`)}
                    >
                        #{orderId}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.customerName}</Text>
                </Space>
            )
        },
        {
            title: 'Phương thức', dataIndex: 'method', key: 'method',
            render: (method: string) => {
                let color = 'default';
                if (method === 'VNPAY') color = 'blue';
                return <Tag color={color} style={{ fontWeight: 500 }}>{method}</Tag>;
            }
        },
        {
            title: 'Số tiền', dataIndex: 'amount', key: 'amount',
            render: (amount: number) => <Text strong type="danger">{formatCurrency(amount)}</Text>
        },
        {
            title: 'Mã đối soát (Txn ID)', dataIndex: 'transactionId', key: 'transactionId',
            render: (txnId: string) => txnId ? <Text copyable>{txnId}</Text> : <Text type="secondary">N/A</Text>
        },
        {
            title: 'Trạng thái', dataIndex: 'status', key: 'status',
            render: (status: string) => {
                if (status === 'PAID') return <Tag color="success">Thành công</Tag>;
                if (status === 'FAILED') return <Tag color="error">Thất bại</Tag>;
                if (status === 'REFUND_PENDING') return <Tag color="processing">Chờ hoàn tiền</Tag>;
                if (status === 'REFUNDED') return <Tag color="default">Đã hoàn tiền</Tag>;
                return <Tag color="warning">Chờ thanh toán</Tag>;
            }
        },
        {
            title: 'Ngày thanh toán', dataIndex: 'paidAt', key: 'paidAt',
            render: (date?: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : <Text type="secondary">---</Text>
        },
        {
            title: 'Thao tác', key: 'action',
            render: (_: any, record: PaymentResponse) => (
                <Space>
                    <Tooltip title="Xem chi tiết đơn hàng">
                        <Button 
                            size="small" 
                            icon={<EyeOutlined />} 
                            onClick={() => navigate(`${ADMIN_ROUTES.ADMIN_ROOT}/${ADMIN_ROUTES.ORDERS}`)}
                        >
                            Xem ĐH
                        </Button>
                    </Tooltip>
                    
                    {record.status === 'REFUND_PENDING' && (
                        <Tooltip title="Xác nhận đã hoàn trả tiền cho khách">
                            <Button
                                size="small"
                                type="primary"
                                style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                                onClick={() => handleConfirmRefund(record.id)}
                            >
                                Đã hoàn tiền
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            )
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <Title level={4} style={{ margin: '0 0 20px 0' }}>Quản lý Giao dịch & Thanh toán</Title>

            <Card size="small" style={{ marginBottom: 20, background: '#fafafa' }}>
                <Space wrap size="large">
                    <div>
                        <Text strong style={{ marginRight: 8 }}>Tìm kiếm:</Text>
                        <Input.Search
                            placeholder="Mã ĐH, Txn ID, Tên..."
                            allowClear
                            onSearch={(value) => setSearchText(value)}
                            style={{ width: 250 }}
                        />
                    </div>

                    <div>
                        <Text strong style={{ marginRight: 8 }}>Phương thức:</Text>
                        <Select value={filterMethod} onChange={setFilterMethod} style={{ width: 120 }}>
                            <Option value="ALL">Tất cả</Option>
                            <Option value="COD">COD</Option>
                            <Option value="VNPAY">VNPay</Option>
                        </Select>
                    </div>

                    <div>
                        <Text strong style={{ marginRight: 8 }}>Trạng thái:</Text>
                        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
                            <Option value="ALL">Tất cả</Option>
                            <Option value="PAID">Thành công</Option>
                            <Option value="PENDING">Chờ thanh toán</Option>
                            <Option value="FAILED">Thất bại</Option>
                            <Option value="REFUND_PENDING">Chờ hoàn tiền</Option>
                            <Option value="REFUNDED">Đã hoàn tiền</Option>
                        </Select>
                    </div>

                    <Button icon={<ReloadOutlined />} onClick={fetchPayments}>Làm mới</Button>
                </Space>
            </Card>

            <Table
                columns={columns}
                dataSource={payments}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default PaymentManager;