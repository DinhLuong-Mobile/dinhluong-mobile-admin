import React, { useEffect } from 'react';
import { 
    Table, Tag, Space, Typography, Input, 
    Select, Switch, Tooltip, Avatar, Card, 
    Button, Drawer, Descriptions, Row, Col, Statistic, Divider, List
} from 'antd';
import { 
    UserOutlined, GoogleOutlined, FacebookOutlined, EyeOutlined, 
    ShoppingCartOutlined, DollarOutlined, CloseCircleOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useUserManager } from './useUserManager';
import type { UserResponse, UserAddress } from '../../../types/user.types';

const { Title, Text } = Typography;
const { Option } = Select;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const UserManager: React.FC = () => {

    const {
        users, loading, stats,
        filterStatus, setFilterStatus, setSearchText,
        detailVisible, setDetailVisible,
        userDetail, detailLoading,
        fetchUsers, fetchStats, fetchUserDetail,
        toggleStatus, exportExcel
    } = useUserManager();

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [fetchUsers, fetchStats]);

    // --- CẤU HÌNH CỘT CHO BẢNG ---
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
                        onChange={(checked) => toggleStatus(record.id, checked)}
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
                    <Button type="primary" shape="circle" icon={<EyeOutlined />} onClick={() => fetchUserDetail(record.id)} />
                </Tooltip>
            )
        }
    ];

    const orderColumns = [
        { title: 'Mã ĐH', dataIndex: 'id', render: (id: number) => `#${id}` },
        { title: 'Ngày đặt', dataIndex: 'createdAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (amount: number) => <Text strong type="danger">{formatCurrency(amount)}</Text> },
        { title: 'Trạng thái', dataIndex: 'status', render: (status: string) => <Tag color="blue">{status}</Tag> }
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <Title level={4} style={{ margin: '0 0 20px 0' }}>Quản lý Tài khoản Khách hàng</Title>

            {/* --- DASHBOARD THỐNG KÊ --- */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card hoverable size="small" style={{ background: '#f0f5ff', borderLeft: '4px solid #2f54eb' }}>
                        <Statistic title="Tổng khách hàng" value={stats.totalUsers} prefix={<UserOutlined />} valueStyle={{ color: '#2f54eb', fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card hoverable size="small" style={{ background: '#f6ffed', borderLeft: '4px solid #52c41a' }}>
                        <Statistic title="Đang hoạt động" value={stats.activeUsers} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card hoverable size="small" style={{ background: '#fff1f0', borderLeft: '4px solid #f5222d' }}>
                        <Statistic title="Tài khoản bị khóa" value={stats.lockedUsers} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#f5222d', fontWeight: 'bold' }} />
                    </Card>
                </Col>
            </Row>

            {/* --- TOOLBAR --- */}
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

                    <Button 
                        type="primary" 
                        style={{ backgroundColor: '#107c41', borderColor: '#107c41' }} 
                        onClick={exportExcel}
                    >
                        Xuất Excel
                    </Button>
                </Space>
            </Card>

            {/* --- BẢNG DỮ LIỆU --- */}
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
                                    <Statistic title="Tổng chi tiêu" value={userDetail.statistics?.totalSpent || 0} formatter={(value) => formatCurrency(Number(value))} prefix={<DollarOutlined />} />
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
                            renderItem={(item: UserAddress) => (
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