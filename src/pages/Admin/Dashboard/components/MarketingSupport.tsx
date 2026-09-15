import React from 'react';
import { Row, Col, Card, Space, Tag, Progress, Typography } from 'antd';
import { GiftOutlined, RobotOutlined, StarOutlined } from '@ant-design/icons';
import type { DashboardResponse } from '../../../../types/dashboard.types';

const { Text } = Typography;

interface MarketingSupportProps {
    activeVouchers?: DashboardResponse['activeVouchers'];
    supportStats?: DashboardResponse['supportStats'];
}

export const MarketingSupport: React.FC<MarketingSupportProps> = ({ activeVouchers, supportStats }) => {
    return (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
                <Card title={<><GiftOutlined /> Hiệu suất Mã giảm giá (Vouchers)</>} bordered={false} style={{ borderRadius: 12, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {activeVouchers?.map(v => {
                            const percent = Math.round((v.used / v.limit) * 100);
                            let statusColor: "success" | "normal" | "exception" = "normal";
                            if (percent >= 90) statusColor = "exception";
                            else if (percent >= 50) statusColor = "success";

                            return (
                                <div key={v.code}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Space>
                                            <Text strong>{v.code}</Text>
                                            <Tag color="default" style={{ fontSize: 10 }}>HSD: {new Date(v.expiry).toLocaleDateString('vi-VN')}</Tag>
                                        </Space>
                                        <Text type="secondary">{v.used} / {v.limit}</Text>
                                    </div>
                                    <Progress percent={percent} status={statusColor} strokeWidth={8} />
                                </div>
                            )
                        })}
                    </Space>
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card title={<><RobotOutlined /> Hiệu quả CSKH & Trợ lý ảo AI</>} bordered={false} style={{ borderRadius: 12, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Row align="middle" justify="center" style={{ height: '100%' }}>
                        <Col span={10} style={{ textAlign: 'center' }}>
                            <Progress
                                type="dashboard"
                                percent={supportStats ? Math.round((supportStats.chatbotHandled / (supportStats.chatbotHandled + supportStats.humanHandled)) * 100) : 0}
                                strokeColor="#722ed1"
                                size={130}
                            />
                            <div style={{ marginTop: 8 }}><Text strong>Tỷ lệ AI tự phục vụ</Text></div>
                        </Col>
                        <Col span={14}>
                            <Space direction="vertical" size="middle" style={{ width: '100%', paddingLeft: 20 }}>
                                <div>
                                    <Text type="secondary">Bot AI đã giải quyết:</Text>
                                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1' }}>{supportStats?.chatbotHandled || 0} tin nhắn</div>
                                </div>
                                <div>
                                    <Text type="secondary">Nhân viên xử lý (Human):</Text>
                                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{supportStats?.humanHandled || 0} tin nhắn</div>
                                </div>
                                <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                                    <Space>
                                        <StarOutlined style={{ color: '#faad14' }} />
                                        <Text strong>Đánh giá SP trung bình:</Text>
                                        <Text style={{ fontSize: 16, color: '#faad14', fontWeight: 'bold' }}>{supportStats?.avgRating || 0} / 5.0</Text>
                                    </Space>
                                </div>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};