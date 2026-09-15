import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Button, Space, Drawer, Descriptions,
    Select, message, Typography, Card, Input, Tabs, Image, List, Modal,
    Tooltip, Col, Statistic, Row, Badge, Dropdown, type MenuProps
} from 'antd';
import {
    CarOutlined, CheckCircleOutlined, CloseCircleOutlined,
    EyeOutlined, ReloadOutlined, SearchOutlined, DownOutlined, ExclamationCircleOutlined,
    DatabaseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { orderService } from '../../../services/orderService'; // CHÚ Ý: Đảm bảo đường dẫn import này đúng với project của bạn

const { Title, Text } = Typography;
const { Option } = Select;

// ==========================================
// 1. INTERFACES
// ==========================================
interface ComboItemDetail { variantId: number; name: string; imageUrl: string; price: number; }
interface OrderItemResponse { id: number; productVariantId: number; productName: string; variantName?: string; imageUrl: string; quantity: number; priceAtPurchase: number; comboItems: ComboItemDetail[]; }
interface OrderDetailResponse {
    id: number; userId: number; totalAmount: number; status: string;
    createdAt: string; receiverName: string; receiverPhone: string; receiverAddress: string;
    paymentMethod: string; paymentStatus: string; reason?: string; userNote?: string;
    discountAmount: number; // Mới
    deliveredAt?: string;
    cancelledBy?: string;
    items: OrderItemResponse[];
}

const statusConfig: Record<string, { color: string, label: string }> = {
    PENDING: { color: 'orange', label: 'Chờ xác nhận' },
    PROCESSING: { color: 'blue', label: 'Đang xử lý' },
    SHIPPED: { color: 'cyan', label: 'Đang giao hàng' },
    DELIVERED: { color: 'green', label: 'Giao thành công' },
    RETURNED: { color: 'volcano', label: 'Chuyển hoàn' },
    CANCELLED: { color: 'red', label: 'Đã hủy' },
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// ==========================================
// 2. COMPONENT CHÍNH
// ==========================================
const OrderManager: React.FC = () => {
    // --- State Dữ liệu ---
    const [orders, setOrders] = useState<OrderDetailResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [stats, setStats] = useState({ pending: 0, processing: 0, shipped: 0, delivered: 0, cancelledOrReturned: 0, total: 0 });

    // --- State Phân trang & Tìm kiếm ---
    const [activeTab, setActiveTab] = useState<string>('ALL');
    const [searchText, setSearchText] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalElements, setTotalElements] = useState<number>(0);

    // --- State UI (Drawer, Modal, Table Selection) ---
    const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetailResponse | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // --- State Lý do Hủy/Hoàn ---
    const [isReasonModalVisible, setIsReasonModalVisible] = useState<boolean>(false);
    const [pendingStatus, setPendingStatus] = useState<string>('');
    const [reasonText, setReasonText] = useState<string>('');
    const [isBulkAction, setIsBulkAction] = useState<boolean>(false);

    // ==========================================
    // 3. FETCH API
    // ==========================================
    const fetchOrders = async (status: string, keyword: string) => {
        setLoading(true);
        try {
            const data = await orderService.getOrders(status, keyword);
            setOrders(data);
            setTotalElements(data.length); // Cập nhật tổng số phần tử cho phân trang
        } catch (error: any) {
            message.error(error.message || 'Lỗi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderStats = async () => {
        try {
            const data = await orderService.getOrderStats();
            setStats(data);
        } catch (error) {
            console.error("Lỗi lấy thống kê", error);
        }
    };

    // Gọi API khi thay đổi Tab, Page hoặc khi Load lần đầu
    useEffect(() => {
        fetchOrders(activeTab, searchText);
        fetchOrderStats();

        // Tự động Refresh ngầm mỗi 60 giây (Real-time update)
        const interval = setInterval(() => { fetchOrderStats(); }, 60000);
        return () => clearInterval(interval);
    }, [activeTab]);

    // ==========================================
    // 4. HANDLERS TÌM KIẾM & CHUYỂN TAB
    // ==========================================
    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
        fetchOrders(activeTab, value);
    };

    const handleTabChange = (key: string) => {
        setActiveTab(key);
        setCurrentPage(1);
        setSelectedRowKeys([]); // Xóa chọn khi chuyển tab
    };

    // ==========================================
    // 5. HANDLERS CẬP NHẬT 1 ĐƠN
    // ==========================================
    const handleSelectStatus = (newStatus: string) => {
        if (newStatus === 'CANCELLED' || newStatus === 'RETURNED') {
            setIsBulkAction(false);
            setPendingStatus(newStatus);
            setReasonText('');
            setIsReasonModalVisible(true);
        } else {
            handleUpdateStatus(newStatus);
        }
    };

    const handleUpdateStatus = async (newStatus: string, reason?: string) => {
        if (!selectedOrder) return;
        if ((newStatus === 'CANCELLED' || newStatus === 'RETURNED') && !reason?.trim()) {
            message.warning("Vui lòng nhập lý do!");
            return;
        }

        try {
            await orderService.updateOrderStatus(selectedOrder.id, newStatus, reason);
            message.success('Cập nhật đơn hàng thành công!');

            setIsReasonModalVisible(false);
            setDrawerVisible(false);

            fetchOrders(activeTab, searchText);
            fetchOrderStats();
        } catch (error: any) {
            message.error(error.message || 'Lỗi hệ thống');
        }
    };

    // ==========================================
    // 6. HANDLERS THAO TÁC HÀNG LOẠT (BULK UPDATE)
    // ==========================================
    const triggerBulkAction = (newStatus: string) => {
        if (newStatus === 'CANCELLED' || newStatus === 'RETURNED') {
            setIsBulkAction(true);
            setPendingStatus(newStatus);
            setReasonText('');
            setIsReasonModalVisible(true);
        } else {
            executeBulkUpdate(newStatus);
        }
    };

    const executeBulkUpdate = async (newStatus: string, reason?: string) => {
        if (selectedRowKeys.length === 0) return;
        if ((newStatus === 'CANCELLED' || newStatus === 'RETURNED') && !reason?.trim()) {
            message.warning("Vui lòng nhập lý do!");
            return;
        }

        try {
            message.loading({ content: 'Đang xử lý...', key: 'bulk' });
            await orderService.updateBulkStatus(selectedRowKeys as number[], newStatus, reason);
            message.success({ content: `Đã cập nhật ${selectedRowKeys.length} đơn hàng!`, key: 'bulk' });

            setIsReasonModalVisible(false);
            setSelectedRowKeys([]);

            fetchOrders(activeTab, searchText, currentPage, pageSize);
            fetchOrderStats();
        } catch (error: any) {
            message.error({ content: error.message || 'Lỗi xử lý hàng loạt', key: 'bulk' });
        }
    };

    // ==========================================
    // 7. XUẤT EXCEL
    // ==========================================
    const handleExportExcel = async () => {
        try {
            message.loading({ content: 'Đang xuất file...', key: 'export' });
            await orderService.exportExcel(activeTab, searchText);
            message.success({ content: 'Xuất Excel thành công!', key: 'export' });
        } catch (error: any) {
            message.error({ content: error.message || 'Lỗi khi xuất file', key: 'export' });
        }
    };

    // ==========================================
    // 8. CẤU HÌNH TABLE COLUMNS
    // ==========================================
    const columns = [
        { title: 'Mã ĐH', dataIndex: 'id', key: 'id', render: (text: number) => <strong>#{text}</strong> },
        { title: 'Khách hàng', key: 'customer', render: (_: any, record: OrderDetailResponse) => (<div><div style={{ fontWeight: 500 }}>{record.receiverName}</div><Text type="secondary">{record.receiverPhone}</Text></div>) },
        {
            title: 'Thanh toán',
            key: 'payment',
            render: (_: any, record: OrderDetailResponse) => (
                <Space direction="vertical" size={0}>
                    <Tag color={record.paymentMethod === 'VNPAY' ? 'blue' : 'default'} style={{ margin: 0 }}>
                        {record.paymentMethod}
                    </Tag>
                    {record.paymentMethod === 'VNPAY' && (
                        <Text
                            type={
                                record.paymentStatus === 'PAID' ? 'success' :
                                    record.paymentStatus === 'REFUND_PENDING' ? 'warning' :
                                        record.paymentStatus === 'REFUNDED' ? 'secondary' : 'danger'
                            }
                            style={{ fontSize: '11px', fontWeight: 500 }}
                        >
                            {
                                record.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                                    record.paymentStatus === 'REFUND_PENDING' ? 'Chờ hoàn tiền' :
                                        record.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền' : 'Chưa TT / Lỗi'
                            }
                        </Text>
                    )}
                </Space>
            )
        },
        {
            title: 'Tổng tiền',
            key: 'totalAmount',
            render: (_: any, record: OrderDetailResponse) => (
                <Space direction="vertical" size={0}>
                    <Text strong type="danger">{formatCurrency(record.totalAmount)}</Text>
                    {record.discountAmount > 0 && (
                        <Text delete type="secondary" style={{ fontSize: '11px' }}>
                            Giảm: {formatCurrency(record.discountAmount)}
                        </Text>
                    )}
                </Space>
            )
        },

        { title: 'Ngày đặt', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
        {
            title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status: string, record: OrderDetailResponse) => {
                const conf = statusConfig[status] || { color: 'default', label: status };

                // Cảnh báo SLA: Nếu đơn PENDING nằm trong kho hơn 2 tiếng -> Hiển thị chấm đỏ
                const hoursDiff = dayjs().diff(dayjs(record.createdAt), 'hour');
                const isOverdue = status === 'PENDING' && hoursDiff >= 2;

                return (
                    <Space>
                        <Tag color={conf.color}>{conf.label}</Tag>
                        {isOverdue && (
                            <Tooltip title={`Đơn hàng bị ngâm quá ${hoursDiff} giờ chưa xác nhận!`}>
                                <Badge status="error" />
                            </Tooltip>
                        )}
                    </Space>
                )
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: OrderDetailResponse) => (
                <Space>
                    <Tooltip title="Xem chi tiết đơn hàng">
                        <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedOrder(record); setDrawerVisible(true); }}>
                            Chi tiết
                        </Button>
                    </Tooltip>
                    {record.paymentMethod === 'VNPAY' && record.paymentStatus === 'PENDING' && (
                        <Tooltip title="Đồng bộ trạng thái VNPAY">
                            <Button size="small" icon={<ReloadOutlined />} onClick={() => message.info(`Đang kiểm tra lại giao dịch cho đơn #${record.id}...`)} />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    const itemColumns = [
        {
            title: 'Sản phẩm', key: 'product',
            render: (_: any, record: OrderItemResponse) => (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Image src={record.imageUrl || 'https://via.placeholder.com/50'} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0' }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.productName}</div>
                        {record.variantName && <div style={{ fontSize: '12px', color: '#888' }}>Phân loại: {record.variantName}</div>}
                    </div>
                </div>
            )
        },
        { title: 'SL', dataIndex: 'quantity', key: 'quantity', align: 'center' as const },
        { title: 'Đơn giá', dataIndex: 'priceAtPurchase', key: 'priceAtPurchase', render: (price: number) => formatCurrency(price) },
        { title: 'Thành tiền', key: 'total', render: (_: any, record: OrderItemResponse) => <Text strong>{formatCurrency(record.priceAtPurchase * record.quantity)}</Text> },
    ];

    const expandedRowRender = (record: OrderItemResponse) => {
        if (!record.comboItems || record.comboItems.length === 0) return null;
        return (
            <div style={{ padding: '10px 20px', backgroundColor: '#fafafa', borderRadius: 4 }}>
                <List
                    size="small" header={<div style={{ fontWeight: 600, color: '#ff4d4f' }}>🎁 Mua kèm / Quà tặng</div>}
                    dataSource={record.comboItems}
                    renderItem={combo => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Image src={combo.imageUrl} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />}
                                title={combo.name}
                                description={<span style={{ fontSize: 12 }}>Số lượng: x{record.quantity}</span>}
                            />
                            <div style={{ fontWeight: 500, color: combo.price === 0 ? '#52c41a' : 'inherit' }}>
                                {combo.price === 0 ? 'Tặng kèm' : formatCurrency(combo.price)}
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        );
    };

    const tabItems = [
        { key: 'ALL', label: 'Tất cả' },
        { key: 'PENDING', label: 'Chờ xác nhận' },
        { key: 'PROCESSING', label: 'Đang xử lý' },
        { key: 'SHIPPED', label: 'Đang giao' },
        { key: 'RETURNED', label: 'Hoàn hàng' },
        { key: 'DELIVERED', label: 'Đã giao' },
        { key: 'CANCELLED', label: 'Đã hủy' },
    ];

    const bulkActionItems: MenuProps['items'] = [
        { key: 'PROCESSING', label: 'Xác nhận Đơn hàng (Đang xử lý)' },
        { key: 'SHIPPED', label: 'Chuyển sang Đang giao' },
        { key: 'DELIVERED', label: 'Xác nhận Đã giao thành công' },
        { type: 'divider' },
        { key: 'CANCELLED', label: 'Hủy các đơn đã chọn', danger: true },
    ];

    // ==========================================
    // 9. RENDER GIAO DIỆN
    // ==========================================
    const failRate = stats.total > 0 ? ((stats.cancelledOrReturned / stats.total) * 100).toFixed(1) : 0;

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: '85vh' }}>

            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Quản lý Đơn hàng</Title>
                <Space>
                    <Input.Search
                        placeholder="Tìm mã ĐH, SĐT, Tên..."
                        allowClear
                        enterButton={<Button type="primary" style={{ backgroundColor: '#1677ff', borderColor: '#1677ff', color: '#fff' }}><SearchOutlined /></Button>}
                        onSearch={handleSearch}
                        style={{ width: 320 }}
                    />
                    <Button type="primary" onClick={handleExportExcel} style={{ backgroundColor: '#107c41', borderColor: '#107c41', color: '#fff' }}>Xuất Excel</Button>
                </Space>
            </div>

            {/* --- MINI DASHBOARD --- */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* CARD TỔNG ĐƠN (MỚI THÊM) */}
                <Col xs={12} sm={12} md={4} style={{ display: 'flex', flex: 1 }}>
                    <Card hoverable size="small" bordered={false} onClick={() => handleTabChange('ALL')} style={{ width: '100%', background: '#f5f5f5', borderColor: '#d9d9d9', borderLeft: '4px solid #8c8c8c' }}>
                        <Statistic title="Tổng đơn hàng" value={stats.total} prefix={<DatabaseOutlined />} valueStyle={{ color: '#595959', fontWeight: 'bold' }} />
                    </Card>
                </Col>

                <Col xs={12} sm={12} md={4} style={{ display: 'flex', flex: 1 }}>
                    <Card hoverable size="small" bordered={false} onClick={() => handleTabChange('PENDING')} style={{ width: '100%', background: '#fff7e6', borderColor: '#ffd591', borderLeft: '4px solid #fa8c16' }}>
                        <Statistic title="Cần xử lý" value={stats.pending} prefix={<ExclamationCircleOutlined />} valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }} />
                    </Card>
                </Col>

                <Col xs={12} sm={12} md={4} style={{ display: 'flex', flex: 1 }}>
                    <Card hoverable size="small" bordered={false} onClick={() => handleTabChange('SHIPPED')} style={{ width: '100%', background: '#e6f4ff', borderColor: '#91caff', borderLeft: '4px solid #1677ff' }}>
                        <Statistic title="Đang giao" value={stats.shipped} prefix={<CarOutlined />} valueStyle={{ color: '#1677ff', fontWeight: 'bold' }} />
                    </Card>
                </Col>

                <Col xs={12} sm={12} md={4} style={{ display: 'flex', flex: 1 }}>
                    <Card hoverable size="small" bordered={false} onClick={() => handleTabChange('DELIVERED')} style={{ width: '100%', background: '#f6ffed', borderColor: '#b7eb8f', borderLeft: '4px solid #52c41a' }}>
                        <Statistic title="Thành công" value={stats.delivered} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
                    </Card>
                </Col>

                <Col xs={12} sm={12} md={4} style={{ display: 'flex', flex: 1 }}>
                    <Card hoverable size="small" bordered={false} onClick={() => handleTabChange('CANCELLED')} style={{ width: '100%', background: '#fff1f0', borderColor: '#ffa39e', borderLeft: '4px solid #f5222d' }}>
                        <Statistic title="Hủy / Hoàn" value={stats.cancelledOrReturned} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#f5222d', fontWeight: 'bold' }} />
                        <Text type="secondary" style={{ fontSize: '11px' }}>Tỷ lệ lỗi: {failRate}%</Text>
                    </Card>
                </Col>
            </Row>

            {/* --- TABS & THAO TÁC HÀNG LOẠT --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} style={{ marginBottom: 0, flex: 1 }} />

                {selectedRowKeys.length > 0 && (
                    <Dropdown menu={{ items: bulkActionItems, onClick: (e) => triggerBulkAction(e.key) }} placement="bottomRight">
                        <Button type="primary" style={{ marginBottom: 16 }}>
                            Thao tác {selectedRowKeys.length} đơn hàng <DownOutlined />
                        </Button>
                    </Dropdown>
                )}
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
                }}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalElements,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    }
                }}
            />

            {/* --- DRAWER CHI TIẾT --- */}
            <Drawer title={`Chi tiết đơn hàng #${selectedOrder?.id}`} width={750} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
                {selectedOrder && (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Card size="small" title="Cập nhật trạng thái">
                            <Space>
                                <Text>Trạng thái hiện tại:</Text>
                                <Select
                                    value={selectedOrder.status}
                                    style={{ width: 170 }}
                                    onChange={handleSelectStatus}
                                    disabled={['DELIVERED', 'RETURNED', 'CANCELLED'].includes(selectedOrder.status)}
                                >
                                    {Object.entries(statusConfig).map(([key, val]) => {
                                        const levels: Record<string, number> = { PENDING: 1, PROCESSING: 2, SHIPPED: 3, DELIVERED: 4, RETURNED: 4, CANCELLED: 99 };
                                        const currentLevel = levels[selectedOrder.status] || 0;
                                        const optionLevel = levels[key] || 0;
                                        const isBackward = optionLevel < currentLevel;
                                        const isInvalidCancel = key === 'CANCELLED' && selectedOrder.status === 'SHIPPED';
                                        const isInvalidReturn = key === 'RETURNED' && selectedOrder.status !== 'SHIPPED';

                                        return (
                                            <Option key={key} value={key} disabled={isBackward || isInvalidCancel || isInvalidReturn}>
                                                {val.label}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Space>
                        </Card>

                        <Descriptions title="Thông tin Đơn hàng" bordered column={1} size="small">
                            <Descriptions.Item label="Người nhận">{selectedOrder.receiverName}</Descriptions.Item>
                            <Descriptions.Item label="Điện thoại">{selectedOrder.receiverPhone}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">{selectedOrder.receiverAddress}</Descriptions.Item>
                            {/* 🔥 THÊM ĐOẠN NÀY ĐỂ HIỂN THỊ NOTE CỦA KHÁCH */}
                            {selectedOrder.userNote && (
                                <Descriptions.Item label="Ghi chú của khách">
                                    <Text type="warning">{selectedOrder.userNote}</Text>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Ngày đặt">{dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                            {selectedOrder.status === 'DELIVERED' && selectedOrder.deliveredAt && (
                                <Descriptions.Item label="Giao thành công lúc">
                                    <Tag color="green">{dayjs(selectedOrder.deliveredAt).format('DD/MM/YYYY HH:mm')}</Tag>
                                </Descriptions.Item>
                            )}

                            <Descriptions.Item label="Thanh toán">
                                <Space>
                                    <Tag color={selectedOrder.paymentMethod === 'VNPAY' ? 'blue' : 'default'} style={{ margin: 0 }}>
                                        {selectedOrder.paymentMethod}
                                    </Tag>
                                    {selectedOrder.paymentMethod === 'VNPAY' && (
                                        <Text
                                            strong
                                            type={
                                                selectedOrder.paymentStatus === 'PAID' ? 'success' :
                                                    selectedOrder.paymentStatus === 'REFUND_PENDING' ? 'warning' :
                                                        selectedOrder.paymentStatus === 'REFUNDED' ? 'secondary' : 'danger'
                                            }
                                        >
                                            ({
                                                selectedOrder.paymentStatus === 'PAID' ? 'Đã thu tiền' :
                                                    selectedOrder.paymentStatus === 'REFUND_PENDING' ? 'Chờ hoàn tiền' :
                                                        selectedOrder.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền' : 'Chưa thanh toán'
                                            })
                                        </Text>
                                    )}
                                </Space>
                            </Descriptions.Item>
                            {selectedOrder.reason && (['CANCELLED', 'RETURNED'].includes(selectedOrder.status)) && (
                                <>
                                    <Descriptions.Item label="Lý do">
                                        <Text type="danger" strong>{selectedOrder.reason}</Text>
                                    </Descriptions.Item>
                                    {/* Nếu BE trả về cancelledBy thì hiển thị thêm dòng này */}
                                    {selectedOrder.cancelledBy && (
                                        <Descriptions.Item label="Người thao tác">
                                            <Tag color={selectedOrder.cancelledBy === 'USER' ? 'orange' : 'red'}>
                                                {selectedOrder.cancelledBy === 'USER' ? 'Khách hàng tự hủy' : 'Admin hệ thống hủy'}
                                            </Tag>
                                        </Descriptions.Item>
                                    )}
                                </>
                            )}
                        </Descriptions>

                        <div>
                            <Title level={5}>Sản phẩm đặt mua</Title>
                            <Table
                                columns={itemColumns} dataSource={selectedOrder.items} rowKey="id" pagination={false} size="small"
                                expandable={{
                                    expandedRowRender,
                                    rowExpandable: record => !!(record.comboItems && record.comboItems.length > 0),
                                    defaultExpandAllRows: true
                                }}
                            />
                            <div style={{ textAlign: 'right', marginTop: 16, padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
                                <Space direction="vertical" align="end" style={{ width: '100%' }}>
                                    <Text>Tiền hàng: {formatCurrency(selectedOrder.totalAmount + selectedOrder.discountAmount)}</Text>
                                    <Text>Giảm giá (Voucher): -{formatCurrency(selectedOrder.discountAmount)}</Text>
                                    <Title level={4} style={{ margin: 0 }}>
                                        Thực thu: <Text type="danger">{formatCurrency(selectedOrder.totalAmount)}</Text>
                                    </Title>
                                </Space>
                            </div>
                        </div>
                    </Space>
                )}
            </Drawer>

            {/* --- MODAL LÝ DO HỦY / HOÀN (DÙNG CHUNG) --- */}
            <Modal
                title={pendingStatus === 'CANCELLED' ? "Xác nhận Hủy đơn hàng" : "Xác nhận Hoàn đơn hàng"}
                open={isReasonModalVisible}
                onOk={() => isBulkAction ? executeBulkUpdate(pendingStatus, reasonText) : handleUpdateStatus(pendingStatus, reasonText)}
                onCancel={() => setIsReasonModalVisible(false)}
                okText="Xác nhận"
                cancelText="Hủy bỏ"
                okButtonProps={{ danger: true }}
            >
                <div style={{ marginBottom: 8 }}>
                    <Text>
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        {isBulkAction ? `Bạn đang thao tác trên ${selectedRowKeys.length} đơn hàng.` : "Vui lòng nhập lý do để lưu lại hệ thống:"}
                    </Text>
                </div>
                <Input.TextArea
                    rows={4}
                    placeholder={pendingStatus === 'CANCELLED' ? "Ví dụ: Khách gọi điện yêu cầu hủy, hết hàng..." : "Ví dụ: Khách bom hàng, Hàng bị vỡ khi ship..."}
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default OrderManager;