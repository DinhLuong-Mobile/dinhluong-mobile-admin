import React from 'react';
import { Modal, Space, Typography, Card, Tag, List, Avatar, Button, Empty, Row, Col } from 'antd';
import { RobotOutlined, CheckCircleOutlined, ShakeOutlined, DollarOutlined, FireOutlined } from '@ant-design/icons';
import type { AiBusinessInsightResponse } from '../../../../types/dashboard.types';

const { Title, Text } = Typography;

interface AiInsightModalProps {
    visible: boolean;
    onClose: () => void;
    insight: AiBusinessInsightResponse | null;
}

export const AiInsightModal: React.FC<AiInsightModalProps> = ({ visible, onClose, insight }) => {
    
    const renderContent = () => {
        if (!insight) return <Empty description="Không có dữ liệu AI" />;

        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ background: '#f9f0ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #722ed1' }}>
                    <Title level={5}><RobotOutlined /> Tóm tắt chiến lược</Title>
                    <Text italic>{insight.executiveSummary}</Text>
                </div>

                {insight?.riskAlerts?.map((risk, idx) => (
                    <Card size="small" key={idx} style={{ border: '1px solid #ffa39e', backgroundColor: '#fff2f0' }}>
                        <Tag color={risk.severity === 'HIGH' ? 'red' : 'orange'}>{risk.severity}</Tag>
                        <Text strong>{risk.issue}</Text>
                        <p style={{ margin: '8px 0 0', color: '#595959' }}>💡 {risk.recommendation}</p>
                    </Card>
                ))}

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Text strong><DollarOutlined /> Tài chính:</Text>
                        <p>{insight?.financialInsight?.analysis}</p>
                    </Col>
                    <Col span={12}>
                        <Text strong><FireOutlined /> Sản phẩm:</Text>
                        <p>{insight?.salesAndProduct?.topPerformersAnalysis}</p>
                    </Col>
                </Row>

                <Title level={5}>3 Hành động gợi ý:</Title>
                <List
                    dataSource={insight?.actionableAdvices || []}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                                title={item.title}
                                description={
                                    <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.7 }}>
                                        <div>{item.detail}</div>
                                        <div style={{ marginTop: 10, padding: '10px 14px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, color: '#389e0d' }}>
                                            <strong>Dự kiến:</strong> {item.expectedImpact}
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Space>
        );
    };

    return (
        <Modal
            title={
                <Space>
                    <ShakeOutlined style={{ color: '#722ed1', fontSize: 24 }} />
                    <span style={{ fontSize: 18, fontWeight: 'bold' }}>Chuyên gia AI Phân tích</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: '#722ed1' }}>
                    Đã hiểu
                </Button>
            ]}
            width={800}
            centered
        >
            <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '10px 0' }}>
                {renderContent()}
            </div>
        </Modal>
    );
};