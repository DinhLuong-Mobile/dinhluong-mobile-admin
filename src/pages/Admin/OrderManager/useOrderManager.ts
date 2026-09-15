import { useState, useEffect } from 'react';
import { message } from 'antd';
import { adminOrderService } from '../../../services'; 
import type { OrderResponse, OrderStatsResponse } from '../../../types/order.types';

export const useOrderManager = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [stats, setStats] = useState<OrderStatsResponse>({ 
        pending: 0, processing: 0, shipped: 0, delivered: 0, cancelledOrReturned: 0, total: 0 
    });

    const [activeTab, setActiveTab] = useState<string>('ALL');
    const [searchText, setSearchText] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalElements, setTotalElements] = useState<number>(0);

    // State dùng để kích hoạt làm mới dữ liệu sau khi cập nhật đơn hàng thành công
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const triggerRefresh = () => setRefreshKey(prev => prev + 1);

    const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [isReasonModalVisible, setIsReasonModalVisible] = useState<boolean>(false);
    const [pendingStatus, setPendingStatus] = useState<any>('PENDING');
    const [reasonText, setReasonText] = useState<string>('');
    const [isBulkAction, setIsBulkAction] = useState<boolean>(false);

    // Quản lý việc fetch danh sách đơn hàng và thống kê hoàn toàn bên trong useEffect
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const params = {
                    status: activeTab !== 'ALL' ? activeTab : undefined,
                    keyword: searchText,
                    page: currentPage,
                    size: pageSize
                };
                const response = await adminOrderService.getAllOrders(params);
                const data = response.data || []; 
                setOrders(data);
                setTotalElements(data.length);
            } catch (error: any) {
                message.error(error.message || 'Lỗi tải danh sách đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        const fetchOrderStats = async () => {
            try {
                const response = await adminOrderService.getStats();
                if (response.data) setStats(response.data);
            } catch (error) {
                console.error("Lỗi lấy thống kê", error);
            }
        };

        fetchOrders();
        fetchOrderStats();

        // Tự động Refresh ngầm mỗi 60 giây
        const interval = setInterval(() => { 
            fetchOrderStats(); 
        }, 60000);

        return () => clearInterval(interval);
    }, [activeTab, searchText, currentPage, pageSize, refreshKey]);

    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handleTabChange = (key: string) => {
        setActiveTab(key);
        setCurrentPage(1);
        setSelectedRowKeys([]);
    };

    const handleSelectStatus = (newStatus: any) => {
        if (newStatus === 'CANCELLED' || newStatus === 'RETURNED') {
            setIsBulkAction(false);
            setPendingStatus(newStatus);
            setReasonText('');
            setIsReasonModalVisible(true);
        } else {
            handleUpdateStatus(newStatus);
        }
    };

    const handleUpdateStatus = async (newStatus: string, reason?: string) => {
        if (!selectedOrder) return;
        if ((newStatus === 'CANCELLED' || newStatus === 'RETURNED') && !reason?.trim()) {
            message.warning("Vui lòng nhập lý do!");
            return;
        }

        try {
            await adminOrderService.updateStatus(selectedOrder.id, { status: newStatus, reason: reason || '' });
            message.success('Cập nhật đơn hàng thành công!');

            setIsReasonModalVisible(false);
            setDrawerVisible(false);

            // Gọi triggerRefresh thay vì gọi trực tiếp hàm fetch
            triggerRefresh();
        } catch (error: any) {
            message.error(error.message || 'Lỗi hệ thống');
        }
    };

    const triggerBulkAction = (newStatus: any) => {
        if (newStatus === 'CANCELLED' || newStatus === 'RETURNED') {
            setIsBulkAction(true);
            setPendingStatus(newStatus);
            setReasonText('');
            setIsReasonModalVisible(true);
        } else {
            executeBulkUpdate(newStatus);
        }
    };

    const executeBulkUpdate = async (newStatus: any, reason?: string) => {
        if (selectedRowKeys.length === 0) return;
        if ((newStatus === 'CANCELLED' || newStatus === 'RETURNED') && !reason?.trim()) {
            message.warning("Vui lòng nhập lý do!");
            return;
        }

        try {
            message.loading({ content: 'Đang xử lý...', key: 'bulk' });
            await adminOrderService.updateBulkStatus({
                orderIds: selectedRowKeys as number[],
                newStatus: newStatus,
                reason
            });
            message.success({ content: `Đã cập nhật ${selectedRowKeys.length} đơn hàng!`, key: 'bulk' });

            setIsReasonModalVisible(false);
            setSelectedRowKeys([]);

            // Gọi triggerRefresh để load lại bảng
            triggerRefresh();
        } catch (error: any) {
            message.error({ content: error.message || 'Lỗi xử lý hàng loạt', key: 'bulk' });
        }
    };

    const handleExportExcel = async () => {
        try {
            message.loading({ content: 'Đang xuất file...', key: 'export' });
            const blob = await adminOrderService.exportExcel({ status: activeTab !== 'ALL' ? activeTab : undefined, keyword: searchText });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `orders_${activeTab}_${new Date().getTime()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            message.success({ content: 'Xuất Excel thành công!', key: 'export' });
        } catch (error: any) {
            message.error({ content: error.message || 'Lỗi khi xuất file', key: 'export' });
        }
    };

    return {
        orders, loading, stats, activeTab, searchText, currentPage, pageSize, totalElements,
        drawerVisible, selectedOrder, selectedRowKeys,
        isReasonModalVisible, pendingStatus, reasonText, isBulkAction,
        setPageSize, setCurrentPage, setDrawerVisible, setSelectedOrder, setSelectedRowKeys, setIsReasonModalVisible, setReasonText,
        handleSearch, handleTabChange, handleSelectStatus, handleUpdateStatus, triggerBulkAction, executeBulkUpdate, handleExportExcel
    };
};