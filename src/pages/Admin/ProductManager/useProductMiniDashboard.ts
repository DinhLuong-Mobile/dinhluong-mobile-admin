import { useState, useEffect } from 'react';
import { adminProductService } from '../../../services';
import type { ProductOverviewStats } from '../../../types/product.types';

export const useProductMiniDashboard = () => {
    const [stats, setStats] = useState<ProductOverviewStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const refetchStats = () => setRefreshKey(prev => prev + 1);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await adminProductService.getOverviewStats();
                setStats(response.data || null);
            } catch (error) {
                console.error("Lỗi tải thống kê tổng quan", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [refreshKey]); 

    return {
        stats,
        loading,
        refetchStats 
    };
};