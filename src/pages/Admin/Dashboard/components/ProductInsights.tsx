import React from 'react';
import { Row, Col, Card, List, Avatar, Typography, Tag } from 'antd';
import { FireOutlined, WarningOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DashboardResponse } from '../../../../types/dashboard.types';

const { Text } = Typography;
const formatVND = (value: number | string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));

interface ProductInsightsProps {
    topProducts?: DashboardResponse['topProducts'];
    lowStockVariants?: DashboardResponse['lowStockVariants'];
    topBrands?: DashboardResponse['topBrands'];
}

export const ProductInsights: React.FC<ProductInsightsProps> = ({ topProducts, lowStockVariants, topBrands }) => {
    return (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} xl={10}>
                <Card title={<><FireOutlined style={{ color: '#ff4d4f' }} /> Top Sản phẩm bán chạy</>} bordered={false} style={{ borderRadius: 12, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <List
                        itemLayout="horizontal"
                        dataSource={topProducts || []}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <div style={{ position: 'relative' }}>
                                            <Avatar size={50} src={item.image} style={{ background: '#f5f5f5' }} />
                                            <div style={{ position: 'absolute', top: -8, left: -8, background: index < 3 ? '#ff4d4f' : '#d9d9d9', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 12, fontWeight: 'bold' }}>
                                                {index + 1}
                                            </div>
                                        </div>
                                    }
                                    title={<Text strong>{item.name}</Text>}
                                    description={<Text type="secondary">{item.variant}</Text>}
                                />
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}>Đã bán: {item.sold}</div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{formatVND(item.revenue)}</Text>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            </Col>

            <Col xs={24} xl={6}>
                <Card title={<><WarningOutlined style={{ color: '#faad14' }} /> Cần nhập hàng gấp</>} bordered={false} style={{ borderRadius: 12, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <List
                        itemLayout="horizontal"
                        dataSource={lowStockVariants || []}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<Text strong>{item.name}</Text>}
                                    description={
                                        <>
                                            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{item.variant}</Text>
                                            <Text type="secondary" style={{ fontSize: 11 }}>SKU: {item.sku}</Text>
                                        </>
                                    }
                                />
                                <Tag color={item.stock === 0 ? 'error' : 'warning'}>Còn: {item.stock}</Tag>
                            </List.Item>
                        )}
                    />
                </Card>
            </Col>

            <Col xs={24} xl={8}>
                <Card title="Doanh thu theo thương hiệu" bordered={false} style={{ borderRadius: 12, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={topBrands || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(v) => `${v / 1000000}Tr`} axisLine={false} tickLine={false} />
                            <RechartsTooltip formatter={(v: any) => formatVND(v)} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                                {topBrands?.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </Row>
    );
};