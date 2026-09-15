import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { DollarOutlined, CheckCircleOutlined, UserAddOutlined, BellOutlined } from '@ant-design/icons';

import type { DashboardResponse } from '../../../../types/dashboard.types'; 

const formatVND = (value: number | string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));

interface OverviewCardsProps {
    overview?: DashboardResponse['overview'];
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
    if (!overview) return null;

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic title="Doanh thu hợp lệ (Đã thanh toán)" value={overview.totalRevenue} formatter={(v) => formatVND(v as number)} valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} prefix={<DollarOutlined />} />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic title="Đơn hàng hoàn tất" value={overview.completedOrders} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} prefix={<CheckCircleOutlined />} />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic title="Khách hàng đăng ký mới" value={overview.newUsers} valueStyle={{ color: '#722ed1', fontWeight: 'bold' }} prefix={<UserAddOutlined />} />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Statistic title="Công việc chờ xử lý (Chat & Đánh giá)" value={overview.pendingTasks} valueStyle={{ color: '#cf1322', fontWeight: 'bold' }} prefix={<BellOutlined />} />
                </Card>
            </Col>
        </Row>
    );
};