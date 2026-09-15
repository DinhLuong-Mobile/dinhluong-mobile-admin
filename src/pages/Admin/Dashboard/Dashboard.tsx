import React from 'react';
import { Spin } from 'antd';
import { useDashboard } from './useDashboard';
import { DashboardHeader } from './components/DashboardHeader';
import { OverviewCards } from './components/OverviewCards';
import { SalesCharts } from './components/SalesCharts';
import { ProductInsights } from './components/ProductInsights';
import { BusinessPerformance } from './components/BusinessPerformance';
import { MarketingSupport } from './components/MarketingSupport';
import { AiInsightModal } from './components/AiInsightModal';

const Dashboard: React.FC = () => {
    const {
        data,
        isLoading,
        timeFilter, setTimeFilter, setCustomDateRange,
        isExporting, handleExportExcel,
        isAiAnalyzing, handleAnalyzeAI,
        aiInsight, isAiModalVisible, setIsAiModalVisible
    } = useDashboard();

    return (
        <div style={{ paddingBottom: 24, backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '24px' }}>

            <DashboardHeader
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                setCustomDateRange={setCustomDateRange}
                handleAnalyzeAI={handleAnalyzeAI}
                isAiAnalyzing={isAiAnalyzing}
                handleExportExcel={handleExportExcel}
                isExporting={isExporting}
            />

            {/* Vùng hiển thị dữ liệu chính */}
            <Spin spinning={isLoading} tip="Đang đồng bộ dữ liệu hệ thống...">

                <OverviewCards overview={data?.overview} />

                <SalesCharts
                    revenueTrends={data?.revenueTrends}
                    paymentMethods={data?.paymentMethods}
                />

                <ProductInsights
                    topProducts={data?.topProducts}
                    lowStockVariants={data?.lowStockVariants}
                    topBrands={data?.topBrands}
                />

                <BusinessPerformance
                    performance={data?.performance}
                    cancellationStats={data?.cancellationStats}
                />

                <MarketingSupport
                    activeVouchers={data?.activeVouchers}
                    supportStats={data?.supportStats}
                />

            </Spin>

            <AiInsightModal
                visible={isAiModalVisible}
                onClose={() => setIsAiModalVisible(false)}
                insight={aiInsight}
            />

        </div>
    );
};

export default Dashboard;