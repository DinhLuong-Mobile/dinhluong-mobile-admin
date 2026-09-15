import React, { useState, useEffect } from 'react';
import { 
    Table, Tag, Space, Typography, Input, 
    Select, Switch, message, Avatar, Card, Tooltip, 
    Button, Drawer, Descriptions, Row, Col, Statistic, Divider, List,Upload,Modal
} from 'antd';
import { UploadOutlined,
    UserOutlined, GoogleOutlined, FacebookOutlined, EyeOutlined, 
    ShoppingCartOutlined, DollarOutlined, CloseCircleOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

// 🔥 IMPORT SERVICE ĐÃ TÁCH
import { 
    userService, 
    type UserResponse, 
    type UserDetailResponse, 
    type UserStatsResponse 
} from '../../../services/userService'; // <-- Điều chỉnh đường dẫn cho đúng dự án của bạn

const { Title, Text } = Typography;
const { Option } = Select;

const UserManager: React.FC = () => {
    // --- STATES ---
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [importReport, setImportReport] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchText, setSearchText] = useState<string>('');

    const [stats, setStats] = useState<UserStatsResponse>({ totalUsers: 0, activeUsers: 0, lockedUsers: 0 });

    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState<boolean>(false);

    // --- HANDLERS DÙNG SERVICE TÁCH RIÊNG ---
    const fetchUsersData = async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers(searchText, filterStatus);
            setUsers(data);
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const data = await userService.getUserStats();
            setStats(data);
        } catch (error) {
            console.error("Lỗi thống kê", error);
        }
    };

    useEffect(() => {
        fetchUsersData();
        fetchUserStats();
    }, [filterStatus, searchText]);

    const handleFetchDetail = async (userId: number) => {
        setDetailVisible(true);
        setDetailLoading(true);
        setUserDetail(null);
        try {
            const data = await userService.getUserDetail(userId);
            setUserDetail(data);
        } catch (error: any) {
            message.error(error.message || "Không thể lấy chi tiết");
            setDetailVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleToggleStatus = async (userId: number, checked: boolean) => {
        try {
            const successMsg = await userService.toggleUserStatus(userId);
            message.success(checked ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản!");
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isEnabled: checked } : u));
            fetchUserStats(); // Cập nhật lại số lượng trên Dashboard
        } catch (error: any) {
            message.error(error.message || "Lỗi cập nhật trạng thái");
        }
    };
    const handleExportExcel = async () => {
        try {
            message.loading({ content: 'Đang chuẩn bị file...', key: 'exporting' });
            const blob = await userService.exportExcel(searchText, filterStatus);
            
            // Tạo link tải file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `KhachHang_DLMStore_${dayjs().format('DDMMYYYY')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            message.success({ content: 'Xuất file thành công!', key: 'exporting' });
        } catch (error: any) {
            message.error({ content: error.message || 'Lỗi khi xuất file', key: 'exporting' });
        }
    };
    // --- CẤU HÌNH COLUMNS (Giữ nguyên như cũ của bạn) ---
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, render: (text: number) => <Text type="secondary">#{text}</Text> },
        { 
            title: 'Khách hàng', 
            render: (_: any, record: UserResponse) => (
                <Space>
                    <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong>{record.fullName || 'Chưa cập nhật tên'}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                    </div>
                </Space>
            )
        },
        { title: 'SĐT', dataIndex: 'phone', render: (text: string) => text || <Text type="secondary">---</Text> },
        { 
            title: 'Loại tài khoản', 
            dataIndex: 'authProvider', 
            render: (provider: string) => {
                if (provider === 'GOOGLE') return <Tag icon={<GoogleOutlined />} color="red">Google</Tag>;
                if (provider === 'FACEBOOK') return <Tag icon={<FacebookOutlined />} color="blue">Facebook</Tag>;
                return <Tag color="default">Mật khẩu</Tag>; 
            }
        },
        { 
            title: 'Trạng thái', 
            align: 'center' as const,
            render: (_: any, record: UserResponse) => (
                <Tooltip title={record.isEnabled ? "Khóa tài khoản này" : "Mở khóa tài khoản"}>
                    <Switch 
                        checked={record.isEnabled} 
                        onChange={(checked) => handleToggleStatus(record.id, checked)}
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Đã khóa"
                        disabled={record.roleName === 'ADMIN'}
                    />
                </Tooltip>
            ) 
        },
        {
            title: 'Hành động',
            align: 'center' as const,
            render: (_: any, record: UserResponse) => (
                <Tooltip title="Xem chi tiết">
                    <Button type="primary" shape="circle" icon={<EyeOutlined />} onClick={() => handleFetchDetail(record.id)} />
                </Tooltip>
            )
        }
    ];

    const orderColumns = [
        { title: 'Mã ĐH', dataIndex: 'id', render: (id: number) => `#${id}` },
        { title: 'Ngày đặt', dataIndex: 'createdAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (amount: number) => `${amount.toLocaleString()} đ` },
        { title: 'Trạng thái', dataIndex: 'status', render: (status: string) => <Tag color="blue">{status}</Tag> }
    ];

    // --- RENDER GIAO DIỆN ---
    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <Title level={4} style={{ margin: '0 0 20px 0' }}>Quản lý Tài khoản Khách hàng</Title>

            {/* --- DASHBOARD THỐNG KÊ --- */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8} style={{ display: 'flex' }}>
                    <Card hoverable size="small" style={{ width: '100%', background: '#f0f5ff', borderLeft: '4px solid #2f54eb' }}>
                        <Statistic title="Tổng khách hàng" value={stats.totalUsers} prefix={<UserOutlined />} valueStyle={{ color: '#2f54eb', fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8} style={{ display: 'flex' }}>
                    <Card hoverable size="small" style={{ width: '100%', background: '#f6ffed', borderLeft: '4px solid #52c41a' }}>
                        <Statistic title="Đang hoạt động" value={stats.activeUsers} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8} style={{ display: 'flex' }}>
                    <Card hoverable size="small" style={{ width: '100%', background: '#fff1f0', borderLeft: '4px solid #f5222d' }}>
                        <Statistic title="Tài khoản bị khóa" value={stats.lockedUsers} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#f5222d', fontWeight: 'bold' }} />
                    </Card>
                </Col>
            </Row>

            {/* --- TOOLBAR TÌM KIẾM & XUẤT/NHẬP --- */}
            <Card size="small" style={{ marginBottom: 20, background: '#fafafa' }}>
                <Space wrap size="large" align="center">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text strong style={{ marginRight: 8 }}>Tìm kiếm:</Text>
                        <Input.Search 
                            placeholder="Tên, Email, SĐT..." 
                            allowClear 
                            onSearch={setSearchText} 
                            style={{ width: 250 }} 
                        />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text strong style={{ marginRight: 8 }}>Trạng thái:</Text>
                        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
                            <Option value="ALL">Tất cả</Option>
                            <Option value="ACTIVE">Đang hoạt động</Option>
                            <Option value="LOCKED">Bị khóa</Option>
                        </Select>
                    </div>

                    {/* --- CỤM NÚT IMPORT VÀ EXPORT --- */}
                   {/* --- CỤM NÚT IMPORT VÀ EXPORT --- */}
                    <Space>
                       

                        <Button 
                            type="primary" 
                            style={{ backgroundColor: '#107c41', borderColor: '#107c41' }} 
                            onClick={handleExportExcel}
                        >
                            Xuất Excel
                        </Button>
                    </Space>
                </Space>
            </Card>

            {/* --- BẢNG DANH SÁCH --- */}
            <Table 
                columns={columns} 
                dataSource={users} 
                rowKey="id" 
                loading={loading} 
                pagination={{ pageSize: 10 }} 
            />

            {/* --- DRAWER CHI TIẾT --- */}
            <Drawer
                title="Chi tiết khách hàng"
                width={720}
                onClose={() => setDetailVisible(false)}
                open={detailVisible}
                loading={detailLoading}
            >
                {userDetail && (
                    <>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Card size="small" bordered={false} style={{ background: '#f6ffed' }}>
                                    <Statistic title="Tổng đơn hàng" value={userDetail.statistics?.totalOrders || 0} prefix={<ShoppingCartOutlined />} />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" bordered={false} style={{ background: '#e6f7ff' }}>
                                    <Statistic title="Tổng chi tiêu" value={userDetail.statistics?.totalSpent || 0} suffix="đ" prefix={<DollarOutlined />} />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" bordered={false} style={{ background: '#fff1f0' }}>
                                    <Statistic title="Đơn đã hủy" value={userDetail.statistics?.cancelledOrders || 0} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#cf1322' }} />
                                </Card>
                            </Col>
                        </Row>

                        <Divider />

                        <Descriptions title="Thông tin cá nhân" bordered size="small" column={2}>
                            <Descriptions.Item label="Họ và tên">{userDetail.fullName || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{userDetail.email}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{userDetail.phone || '---'}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đăng ký">{dayjs(userDetail.createdAt).format('DD/MM/YYYY')}</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Title level={5}>Sổ địa chỉ</Title>
                        <List
                            size="small" bordered dataSource={userDetail.addresses}
                            locale={{ emptyText: 'Chưa có địa chỉ nào' }}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Text strong>{item.receiverName} - {item.receiverPhone}</Text>}
                                        description={item.fullAddress}
                                    />
                                </List.Item>
                            )}
                            style={{ marginBottom: 24 }}
                        />

                        <Title level={5}>Đơn hàng gần đây</Title>
                        <Table 
                            size="small" columns={orderColumns} dataSource={userDetail.recentOrders} 
                            rowKey="id" pagination={false} locale={{ emptyText: 'Chưa có đơn hàng nào' }}
                        />
                    </>
                )}
            </Drawer>

               


        </div>
    );
};

export default UserManager;