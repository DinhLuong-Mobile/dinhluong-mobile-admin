import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { 
    AppstoreOutlined, 
    CheckCircleOutlined, 
    WarningOutlined, 
    StopOutlined,
    InboxOutlined
} from '@ant-design/icons';
import { useProductMiniDashboard } from './useProductMiniDashboard';

const { Text } = Typography;

const ProductMiniDashboard: React.FC = () => {
    // Gọi custom hook để lấy data
    const { stats, loading } = useProductMiniDashboard();

    return (
        <div style={{ marginBottom: 24 }}>
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
                Tổng quan kho hàng
            </Text>
            
            <Row gutter={[16, 16]}>
                {/* Tổng sản phẩm */}
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card size="small" bordered={false} loading={loading} style={{ background: '#f0f5ff', borderRadius: 8 }}>
                        <Statistic
                            title="Tổng SP"
                            value={stats?.totalProducts || 0}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                            prefix={<AppstoreOutlined />}
                        />
                    </Card>
                </Col>

                {/* Đang bán */}
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card size="small" bordered={false} loading={loading} style={{ background: '#f6ffed', borderRadius: 8 }}>
                        <Statistic
                            title="Đang hoạt động"
                            value={stats?.activeProducts || 0}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>

                {/* Đã ẩn */}
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card size="small" bordered={false} loading={loading} style={{ background: '#f5f5f5', borderRadius: 8 }}>
                        <Statistic
                            title="Tạm ẩn"
                            value={stats?.inactiveProducts || 0}
                            valueStyle={{ color: '#8c8c8c', fontWeight: 'bold' }}
                            prefix={<StopOutlined />}
                        />
                    </Card>
                </Col>

                {/* Hết hàng (Nổi bật nhất) */}
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card size="small" bordered={false} loading={loading} style={{ background: '#fff1f0', border: '1px solid #ffccc7', borderRadius: 8 }}>
                        <Statistic
                            title={<Text type="danger">Mẫu hết hàng</Text>}
                            value={stats?.outOfStockVariants || 0}
                            valueStyle={{ color: '#f5222d', fontWeight: 'bold' }}
                            prefix={<InboxOutlined />}
                            suffix={<span style={{ fontSize: 12, color: '#f5222d' }}>cần nhập</span>}
                        />
                    </Card>
                </Col>

                {/* Sắp hết hàng */}
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card size="small" bordered={false} loading={loading} style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                        <Statistic
                            title={<Text type="warning">Mẫu sắp hết</Text>}
                            value={stats?.lowStockVariants || 0}
                            valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                            prefix={<WarningOutlined />}
                            suffix={<span style={{ fontSize: 12, color: '#faad14' }}>&lt; 5 cái</span>}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProductMiniDashboard;