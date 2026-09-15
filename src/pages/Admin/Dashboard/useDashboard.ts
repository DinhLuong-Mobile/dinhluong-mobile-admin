import { useState, useEffect,useCallback } from 'react';
import { message } from 'antd';

import { adminDashboardService } from '../../../services'; 
import type { DashboardResponse, AiBusinessInsightResponse } from '../../../types/dashboard.types';

export const useDashboard = () => {
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [timeFilter, setTimeFilter] = useState<string>('this_month');
    const [customDateRange, setCustomDateRange] = useState<[string, string] | null>(null);
    
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
    const [aiInsight, setAiInsight] = useState<AiBusinessInsightResponse | null>(null);
    const [isAiModalVisible, setIsAiModalVisible] = useState<boolean>(false);

   const getFilterParams = useCallback(() => {
        return {
            time: timeFilter,
            startDate: customDateRange?.[0],
            endDate: customDateRange?.[1]
        };
    }, [timeFilter, customDateRange]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (timeFilter === 'custom' && (!customDateRange || !customDateRange[0] || !customDateRange[1])) {
                return; 
            }
            
            setIsLoading(true);
            try {
                const params = getFilterParams();
                const response = await adminDashboardService.getDashboard(params);
                setData(response.data); 
            } catch (error: any) {
                console.error(error); 
                message.error(error.message || 'Không thể tải dữ liệu!');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDashboardData();
    }, [getFilterParams,timeFilter, customDateRange]);

    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            const params = getFilterParams();
            
            const blob = await adminDashboardService.exportDashboard(params);
            
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
        try {
            setIsAiAnalyzing(true);
            const params = getFilterParams();
            const response = await adminDashboardService.getAiInsights(params);
            setAiInsight(response.data); 
            setIsAiModalVisible(true);
            message.success('Chuyên gia AI đã phân tích xong!');
        } catch (error) {
            console.error(error);
            message.error("AI đang bận, thử lại sau nhé!");
        } finally {
            setIsAiAnalyzing(false);
        }
    };

    return {
        data,
        isLoading,
        timeFilter,
        setTimeFilter,
        setCustomDateRange,
        isExporting,
        handleExportExcel,
        isAiAnalyzing,
        handleAnalyzeAI,
        aiInsight,
        isAiModalVisible,
        setIsAiModalVisible
    };
};