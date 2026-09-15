import React from 'react';
import { Row, Col, Card, Empty } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { DashboardResponse } from '../../../../types/dashboard.types';

const formatVND = (value: number | string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));

interface SalesChartsProps {
    revenueTrends?: DashboardResponse['revenueTrends'];
    paymentMethods?: DashboardResponse['paymentMethods'];
}

export const SalesCharts: React.FC<SalesChartsProps> = ({ revenueTrends, paymentMethods }) => {
    return (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={16}>
                <Card title="Xu hướng Doanh thu & Lượng đơn hàng" bordered={false} style={{ borderRadius: 12, height: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    {revenueTrends && revenueTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueTrends} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tickFormatter={(v) => `${v / 1000000}Tr`} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                                <RechartsTooltip formatter={(value: any, name: any) => name === 'revenue' ? formatVND(value) : value} />
                                <Legend />
                                <Line yAxisId="left" name="Doanh thu (VNĐ)" type="monotone" dataKey="revenue" stroke="#1890ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                <Line yAxisId="right" name="Số đơn hàng" type="monotone" dataKey="orders" stroke="#52c41a" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <Empty description="Không có dữ liệu giao dịch" style={{ marginTop: 60 }} />}
                </Card>
            </Col>

            <Col xs={24} lg={8}>
                <Card title={<><CreditCardOutlined /> Tỷ trọng Thanh toán</>} bordered={false} style={{ borderRadius: 12, height: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={paymentMethods || []} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                {paymentMethods?.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <RechartsTooltip formatter={(val: any) => `${val}%`} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </Row>
    );
};