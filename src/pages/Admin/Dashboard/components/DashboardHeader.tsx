import React from 'react';
import { Space, Select, DatePicker, Button, Typography } from 'antd';
import { ShakeOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface DashboardHeaderProps {
    timeFilter: string;
    setTimeFilter: (val: string) => void;
    setCustomDateRange: (range: [string, string] | null) => void;
    handleAnalyzeAI: () => void;
    isAiAnalyzing: boolean;
    handleExportExcel: () => void;
    isExporting: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    timeFilter,
    setTimeFilter,
    setCustomDateRange,
    handleAnalyzeAI,
    isAiAnalyzing,
    handleExportExcel,
    isExporting
}) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
                <Title level={3} style={{ margin: 0 }}>Trung tâm điều hành</Title>
                <Text type="secondary">Tổng quan hoạt động kinh doanh và vận hành hệ thống</Text>
            </div>
            <Space>
                {timeFilter === 'custom' && (
                    <RangePicker
                        format="YYYY-MM-DD"
                        onChange={(dates, dateStrings) => {
                            if (dateStrings && dateStrings[0] !== "" && dateStrings[1] !== "") {
                                setCustomDateRange([dateStrings[0], dateStrings[1]]);
                            } else {
                                setCustomDateRange(null);
                            }
                        }}
                    />
                )}
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
    );
};