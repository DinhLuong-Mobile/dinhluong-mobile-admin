import React from 'react';
import { Row, Col, Card, Statistic, Progress, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import type { DashboardResponse } from '../../../../types/dashboard.types';

const { Text } = Typography;
const formatVND = (value: number | string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));

interface BusinessPerformanceProps {
    performance?: DashboardResponse['performance'];
    cancellationStats?: DashboardResponse['cancellationStats'];
}

export const BusinessPerformance: React.FC<BusinessPerformanceProps> = ({ performance, cancellationStats }) => {
    
    // Sort logic đưa vào component này luôn cho gọn
    const topCancellationData = cancellationStats
        ?.sort((a, b) => b.count - a.count)
        .slice(0, 5) || [];

    return (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
                <Card title="Chỉ số vận hành (Health Check)" bordered={false} style={{ borderRadius: 12, height: '100%' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Statistic title="Tỉ lệ chốt đơn" value={performance?.conversionRate || 0} suffix="%" valueStyle={{ color: '#3f8600' }} />
                            <Progress percent={performance?.conversionRate || 0} status="active" strokeColor="#52c41a" />
                        </Col>
                        <Col span={12}>
                            <Statistic title="Tỉ lệ hoàn hàng" value={performance?.returnRate || 0} suffix="%" valueStyle={{ color: '#cf1322' }} />
                            <Progress percent={performance?.returnRate || 0} status="exception" strokeColor="#ff4d4f" />
                        </Col>
                    </Row>
                    <div style={{ marginTop: 20, padding: '12px', background: '#fff1f0', borderRadius: '8px' }}>
                        <Text type="secondary">Doanh thu thất thoát (Hủy/Hoàn):</Text>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#cf1322' }}>
                            {formatVND(performance?.lostRevenue || 0)}
                        </div>
                    </div>
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card title="Phân tích lý do hủy đơn" bordered={false} style={{ borderRadius: 12, height: '100%' }}>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart layout="vertical" data={topCancellationData} margin={{ left: 40, right: 40 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="reason" type="category" width={150} />
                            <RechartsTooltip />
                            <Bar dataKey="count" fill="#ff4d4f" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </Row>
    );
};