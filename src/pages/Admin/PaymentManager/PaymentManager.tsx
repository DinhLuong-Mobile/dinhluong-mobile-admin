import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Button, Space, Select, message, Typography, Card, Input, Tooltip, Modal
} from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

// --- Định nghĩa Type khớp với DTO PaymentResponse từ Backend ---
interface PaymentResponse {
    id: number;
    orderId: number;
    method: 'COD' | 'VNPAY'; // Bỏ MOMO
    amount: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED'; // Thêm trạng thái hoàn
    transactionId?: string;
    paidAt?: string;
    customerName?: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const PaymentManager: React.FC = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // States cho bộ lọc API
    const [filterMethod, setFilterMethod] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchText, setSearchText] = useState<string>('');

    // Lấy Token từ local storage
    const getAuthToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).token : '';
    };

    // --- FETCH DATA TỪ BACKEND API ---
    const fetchPayments = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();

            // Đóng gói các tham số tìm kiếm thành Query String
            const queryParams = new URLSearchParams({
                method: filterMethod,
                status: filterStatus,
                keyword: searchText
            }).toString();

            const response = await fetch(`http://localhost:8080/api/admin/payments?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const json = await response.json();

            if (response.ok && json.status === 'success') {
                setPayments(json.data);
            } else {
                message.error(json.message || "Không thể tải danh sách giao dịch");
            }
        } catch (error) {
            message.error("Lỗi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    // Tự động gọi API mỗi khi các bộ lọc thay đổi
    useEffect(() => {
        fetchPayments();
    }, [filterMethod, filterStatus, searchText]);

    // --- HÀM XỬ LÝ XÁC NHẬN ĐÃ HOÀN TIỀN ---
    const handleConfirmRefund = (paymentId: number) => {
        Modal.confirm({
            title: 'Xác nhận Đã hoàn tiền?',
            content: 'Bạn có chắc chắn là tiền đã được chuyển trả lại cho khách hàng không? Hành động này không thể hoàn tác.',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const token = getAuthToken();
                    const response = await fetch(`http://localhost:8080/api/admin/payments/${paymentId}/refunded`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const json = await response.json();
                    if (response.ok && json.status === 'success') {
                        message.success("Cập nhật trạng thái hoàn tiền thành công!");
                        fetchPayments(); // Load lại bảng để cập nhật trạng thái mới nhất
                    } else {
                        message.error(json.message || "Lỗi khi cập nhật trạng thái");
                    }
                } catch (error) {
                    message.error("Lỗi kết nối máy chủ");
                }
            }
        });
    };

    // --- CẤU HÌNH CỘT CHO BẢNG ---
    const columns = [
        {
            title: 'Mã GD', dataIndex: 'id', key: 'id',
            render: (text: number) => <Text type="secondary">#{text}</Text>
        },
        {
            title: 'Mã Đơn Hàng', dataIndex: 'orderId', key: 'orderId',
            render: (orderId: number, record: PaymentResponse) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => navigate(`/admin/orders`)}>
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
                        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/admin/orders`)}>Xem ĐH</Button>
                    </Tooltip>
                    
                    {record.method !== 'COD' && record.status === 'PENDING' && (
                        <Tooltip title="Đồng bộ lại trạng thái từ Cổng thanh toán">
                            <Button size="small" icon={<ReloadOutlined />} onClick={() => message.info(`Đang kiểm tra lại giao dịch ${record.orderId}...`)} />
                        </Tooltip>
                    )}

                    {/* Nút thao tác riêng cho trạng thái chờ hoàn tiền */}
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

            {/* --- THANH CÔNG CỤ TÌM KIẾM & LỌC --- */}
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

            {/* --- BẢNG DỮ LIỆU --- */}
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