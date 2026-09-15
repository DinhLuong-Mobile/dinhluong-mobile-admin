import React, { useState, useEffect } from 'react';
import { Button, message, Card, Col, Row, Statistic, Table, Tag, Typography, List, Avatar, Progress, Space, Select, DatePicker, Spin, Empty, Modal } from 'antd';
import { DownloadOutlined, ShakeOutlined } from '@ant-design/icons';
import {
    DollarOutlined,
    CheckCircleOutlined,
    UserAddOutlined,
    BellOutlined,
    FireOutlined,
    WarningOutlined,
    CreditCardOutlined,
    GiftOutlined,
    RobotOutlined,
    StarOutlined,
} from '@ant-design/icons';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar, RadialBarChart, RadialBar
} from 'recharts';
import { dashboardService } from '../../../services/dashboard.service';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ==========================================
// 1. INTERFACE DỮ LIỆU TỪ API (Ánh xạ từ Database)
// ==========================================
interface DashboardData {
    overview: {
        totalRevenue: number;
        completedOrders: number;
        newUsers: number;
        pendingTasks: number;
    };
    revenueTrends: { date: string; revenue: number; orders: number }[];
    paymentMethods: { name: string; value: number; color: string }[];
    topProducts: { id: number; name: string; variant: string; sold: number; image: string; revenue: number }[];
    lowStockVariants: { sku: string; name: string; variant: string; stock: number; image: string }[];
    topBrands: { name: string; revenue: number; fill: string }[];
    activeVouchers: { code: string; used: number; limit: number; expiry: string }[];
    supportStats: { chatbotHandled: number; humanHandled: number; avgRating: number };
    cancellationStats: { reason: string; count: number }[];
    performance: {
        conversionRate: number;
        returnRate: number;
        lostRevenue: number;
    };
}

interface AiBusinessInsightResponse {
    executiveSummary: string;
    financialInsight: { trend: string; analysis: string };
    salesAndProduct: { topPerformersAnalysis: string; crossSellOpportunities: string };
    customerService: { satisfactionAnalysis: string; cancellationInsights: string };
    riskAlerts: { severity: string; issue: string; recommendation: string }[];
    actionableAdvices: { title: string; detail: string; expectedImpact: string }[];
}

const formatVND = (value: number | string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
const renderAiContent = (insight: AiBusinessInsightResponse) => {
    if (!insight) {
        return <Empty description="Không có dữ liệu AI" />;
    }

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Tóm tắt cấp cao */}
            <div
                style={{
                    background: '#f9f0ff',
                    padding: '16px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #722ed1',
                }}
            >
                <Title level={5}>
                    <RobotOutlined /> Tóm tắt chiến lược
                </Title>

                <Text italic>{insight.executiveSummary}</Text>
            </div>

            {/* Rủi ro */}
            {insight?.riskAlerts?.map((risk, idx) => (
                <Card
                    size="small"
                    key={idx}
                    style={{
                        border: '1px solid #ffa39e',
                        backgroundColor: '#fff2f0',
                    }}
                >
                    <Tag color={risk.severity === 'HIGH' ? 'red' : 'orange'}>
                        {risk.severity}
                    </Tag>

                    <Text strong>{risk.issue}</Text>

                    <p style={{ margin: '8px 0 0', color: '#595959' }}>
                        💡 {risk.recommendation}
                    </p>
                </Card>
            ))}

            {/* Phân tích */}
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Text strong>
                        <DollarOutlined /> Tài chính:
                    </Text>

                    <p>{insight?.financialInsight?.analysis}</p>
                </Col>

                <Col span={12}>
                    <Text strong>
                        <FireOutlined /> Sản phẩm:
                    </Text>

                    <p>{insight?.salesAndProduct?.topPerformersAnalysis}</p>
                </Col>
            </Row>

            {/* Đề xuất */}
            <Title level={5}>3 Hành động gợi ý:</Title>

            <List
                dataSource={insight?.actionableAdvices || []}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    icon={<CheckCircleOutlined />}
                                    style={{ backgroundColor: '#52c41a' }}
                                />
                            }
                            title={item.title}
                            description={
                                <div
                                    style={{
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        lineHeight: 1.7,
                                    }}
                                >
                                    <div>{item.detail}</div>

                                    <div
                                        style={{
                                            marginTop: 10,
                                            padding: '10px 14px',
                                            background: '#f6ffed',
                                            border: '1px solid #b7eb8f',
                                            borderRadius: 8,
                                            color: '#389e0d',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                        }}
                                    >
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
// ==========================================
// 2. COMPONENT CHÍNH
// ==========================================
const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [timeFilter, setTimeFilter] = useState<string>('this_month');
    const [customDateRange, setCustomDateRange] = useState<[string, string] | null>(null);
    // --- STATE CHO TÍNH NĂNG AI ---
    const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
    const [aiInsight, setAiInsight] =
        useState<AiBusinessInsightResponse | null>(null);
    const [isAiModalVisible, setIsAiModalVisible] = useState<boolean>(false);

    const getAuthToken = () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).token : '';
    };
    
    // ==========================================
    // 3. XỬ LÝ SỰ KIỆN & GỌI API
    // ==========================================
    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            const blob = await dashboardService.exportExcel(timeFilter, customDateRange);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dashboard_${timeFilter}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            message.success('Xuất Excel thành công!');
        } catch (error: any) {
            console.error(error);
            message.error(error.message || 'Không thể xuất Excel!');
        } finally {
            setIsExporting(false);
        }
    };

    const handleAnalyzeAI = async () => {
        setIsAiAnalyzing(true);
        try {
            // Backend giờ trả về DTO AiAnalysisResponse thay vì String
            const response = await dashboardService.getAiInsights(timeFilter, customDateRange);
            setAiInsight(response);
            setIsAiModalVisible(true);
            message.success('Chuyên gia AI đã phân tích xong!');
        } catch (error) {
            message.error("AI đang bận, thử lại sau nhé!");
        } finally {
            setIsAiAnalyzing(false);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (timeFilter === 'custom' && (!customDateRange || !customDateRange[0] || !customDateRange[1])) {
            return; 
        }
            setIsLoading(true);
            try {
                const dashboardData = await dashboardService.getDashboardData(timeFilter, customDateRange);
                setData(dashboardData);
            } catch (error: any) {
                console.error("Lỗi:", error);
                message.error(error.message || 'Không thể tải dữ liệu!');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [timeFilter, customDateRange]);

    // ==========================================
    // 4. RENDER GIAO DIỆN
    // ==========================================
    const topCancellationData = data?.cancellationStats
    ?.sort((a, b) => b.count - a.count) // Sắp xếp giảm dần
    .slice(0, 5) || [];
    return (
        <div style={{ paddingBottom: 24, backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '24px' }}>

            {/* --- HEADER & BỘ LỌC THỜI GIAN --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Trung tâm điều hành</Title>
                    <Text type="secondary">Tổng quan hoạt động kinh doanh và vận hành hệ thống</Text>
                </div>
                <Space>
                    {timeFilter === 'custom' && <RangePicker
                        format="YYYY-MM-DD"
                        onChange={(dates, dateStrings) => {
                            // dateStrings trả về mảng 2 phần tử: [startDate, endDate]
                            if (dateStrings && dateStrings[0] !== "" && dateStrings[1] !== "") {
                                setCustomDateRange([dateStrings[0], dateStrings[1]]);
                            } else {
                                setCustomDateRange(null);
                            }
                        }}
                    />}
                    <Select value={timeFilter} onChange={setTimeFilter} style={{ width: 160 }} size="large">
                        <Option value="today">Hôm nay</Option>
                        <Option value="this_week">Tuần này</Option>
                        <Option value="this_month">Tháng này</Option>
                        <Option value="this_year">Năm nay</Option>
                        <Option value="custom">Tùy chỉnh...</Option>
                    </Select>

                    <Button
                        type="primary"
                        icon={<ShakeOutlined />}
                        size="large"
                        onClick={handleAnalyzeAI}
                        loading={isAiAnalyzing}
                        style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                    >
                        Phân tích AI
                    </Button>

                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        size="large"
                        onClick={handleExportExcel}
                        loading={isExporting}
                        style={{ backgroundColor: '#107c41', borderColor: '#107c41' }}
                    >
                        Xuất Excel
                    </Button>
                </Space>
            </div>

            <Spin spinning={isLoading} tip="Đang đồng bộ dữ liệu hệ thống...">
                {/* --- ROW 1: 4 THẺ KPI CHÍNH --- */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Statistic title="Doanh thu hợp lệ (Đã thanh toán)" value={data?.overview.totalRevenue || 0} formatter={(v) => formatVND(v as number)} valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} prefix={<DollarOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Statistic title="Đơn hàng hoàn tất" value={data?.overview.completedOrders || 0} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} prefix={<CheckCircleOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Statistic title="Khách hàng đăng ký mới" value={data?.overview.newUsers || 0} valueStyle={{ color: '#722ed1', fontWeight: 'bold' }} prefix={<UserAddOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Statistic title="Công việc chờ xử lý (Chat & Đánh giá)" value={data?.overview.pendingTasks || 0} valueStyle={{ color: '#cf1322', fontWeight: 'bold' }} prefix={<BellOutlined />} />
                        </Card>
                    </Col>
                </Row>

                {/* --- ROW 2: BIỂU ĐỒ DOANH THU & PHƯƠNG THỨC THANH TOÁN --- */}
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} lg={16}>
                        <Card title="Xu hướng Doanh thu & Lượng đơn hàng" bordered={false} style={{ borderRadius: 12, height: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            {data?.revenueTrends && data.revenueTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.revenueTrends} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="left" tickFormatter={(v) => `${v / 1000000}Tr`} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                                        <RechartsTooltip formatter={(value: number, name: string) => name === 'revenue' ? formatVND(value) : value} />
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
                                    <Pie data={data?.paymentMethods || []} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {data?.paymentMethods?.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <RechartsTooltip formatter={(val: number) => `${val}%`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* --- ROW 3: SẢN PHẨM & KHO HÀNG --- */}
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} xl={10}>
                        <Card title={<><FireOutlined style={{ color: '#ff4d4f' }} /> Top Sản phẩm bán chạy</>} bordered={false} style={{ borderRadius: 12, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <List
                                itemLayout="horizontal"
                                dataSource={data?.topProducts || []}
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
                                dataSource={data?.lowStockVariants || []}
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
                                <BarChart data={data?.topBrands || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={(v) => `${v / 1000000}Tr`} axisLine={false} tickLine={false} />
                                    <RechartsTooltip formatter={(v: number) => formatVND(v)} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                                        {data?.topBrands?.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
                {/* --- ROW MỚI: HIỆU SUẤT & LÝ DO HỦY ĐƠN --- */}
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} lg={12}>
                        <Card title="Chỉ số vận hành (Health Check)" bordered={false} style={{ borderRadius: 12, height: '100%' }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Tỉ lệ chốt đơn"
                                        value={data?.performance.conversionRate}
                                        suffix="%"
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                    <Progress percent={data?.performance.conversionRate} status="active" strokeColor="#52c41a" />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Tỉ lệ hoàn hàng"
                                        value={data?.performance.returnRate}
                                        suffix="%"
                                        valueStyle={{ color: '#cf1322' }}
                                    />
                                    <Progress percent={data?.performance.returnRate} status="exception" strokeColor="#ff4d4f" />
                                </Col>
                            </Row>
                            <div style={{ marginTop: 20, padding: '12px', background: '#fff1f0', borderRadius: '8px' }}>
                                <Text type="secondary">Doanh thu thất thoát (Hủy/Hoàn):</Text>
                                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#cf1322' }}>
                                    {formatVND(data?.performance.lostRevenue || 0)}
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
                {/* --- ROW 4: MARKETING & CSKH --- */}
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} lg={12}>
                        <Card title={<><GiftOutlined /> Hiệu suất Mã giảm giá (Vouchers)</>} bordered={false} style={{ borderRadius: 12, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {data?.activeVouchers?.map(v => {
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
                                        percent={data?.supportStats ? Math.round((data.supportStats.chatbotHandled / (data.supportStats.chatbotHandled + data.supportStats.humanHandled)) * 100) : 0}
                                        strokeColor="#722ed1"
                                        size={130}
                                    />
                                    <div style={{ marginTop: 8 }}><Text strong>Tỷ lệ AI tự phục vụ</Text></div>
                                </Col>
                                <Col span={14}>
                                    <Space direction="vertical" size="middle" style={{ width: '100%', paddingLeft: 20 }}>
                                        <div>
                                            <Text type="secondary">Bot AI đã giải quyết:</Text>
                                            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1' }}>{data?.supportStats.chatbotHandled} tin nhắn</div>
                                        </div>
                                        <div>
                                            <Text type="secondary">Nhân viên xử lý (Human):</Text>
                                            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{data?.supportStats.humanHandled} tin nhắn</div>
                                        </div>
                                        <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                                            <Space>
                                                <StarOutlined style={{ color: '#faad14' }} />
                                                <Text strong>Đánh giá SP trung bình:</Text>
                                                <Text style={{ fontSize: 16, color: '#faad14', fontWeight: 'bold' }}>{data?.supportStats.avgRating} / 5.0</Text>
                                            </Space>
                                        </div>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Spin>

            <Modal
                title={
                    <Space>
                        <ShakeOutlined style={{ color: '#722ed1', fontSize: 24 }} />
                        <span style={{ fontSize: 18, fontWeight: 'bold' }}>Chuyên gia AI Phân tích</span>
                    </Space>
                }
                open={isAiModalVisible}
                onCancel={() => setIsAiModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsAiModalVisible(false)} style={{ backgroundColor: '#722ed1' }}>
                        Đã hiểu
                    </Button>
                ]}
                width={800}
                centered
            >
                <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '10px 0' }}>
                    {/* GỌI HÀM RENDER Ở ĐÂY */}
                    {renderAiContent(aiInsight)}
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;