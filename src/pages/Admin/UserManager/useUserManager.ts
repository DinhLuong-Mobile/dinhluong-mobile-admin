import { useState, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { adminUserService } from '../../../services';
import type { UserResponse, UserDetailResponse, UserDashboardStats } from '../../../types/user.types';

export const useUserManager = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [stats, setStats] = useState<UserDashboardStats>({ totalUsers: 0, activeUsers: 0, lockedUsers: 0 });
    
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchText, setSearchText] = useState<string>('');

    // Drawer States
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState<boolean>(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            let isEnabled: boolean | undefined = undefined;
            if (filterStatus === 'ACTIVE') isEnabled = true;
            if (filterStatus === 'LOCKED') isEnabled = false;

            const response = await adminUserService.getAllUsers({ keyword: searchText, isEnabled });
            if (response && response.code === 200 && response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    }, [searchText, filterStatus]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await adminUserService.getUserStats();
            if (response && response.code === 200 && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Lỗi thống kê", error);
        }
    }, []);

    const fetchUserDetail = async (userId: number) => {
        setDetailVisible(true);
        setDetailLoading(true);
        setUserDetail(null);
        try {
            const response = await adminUserService.getUserDetail(userId);
            if (response && response.code === 200 && response.data) {
                setUserDetail(response.data);
            } else {
                message.error(response?.message || "Không thể lấy chi tiết");
                setDetailVisible(false);
            }
        } catch (error) {
            message.error("Lỗi kết nối khi lấy chi tiết");
            setDetailVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const toggleStatus = async (userId: number, checked: boolean) => {
        try {
            const response = await adminUserService.toggleStatus(userId);
            if (response && response.code === 200) {
                message.success(checked ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản!");
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, isEnabled: checked } : u));
                fetchStats(); // Update Dashboard stats
            } else {
                message.error(response?.message || "Lỗi cập nhật trạng thái");
            }
        } catch (error) {
            message.error("Lỗi kết nối khi cập nhật trạng thái");
        }
    };

    const exportExcel = async () => {
        try {
            message.loading({ content: 'Đang chuẩn bị file...', key: 'exporting' });
            
            let isEnabled: boolean | undefined = undefined;
            if (filterStatus === 'ACTIVE') isEnabled = true;
            if (filterStatus === 'LOCKED') isEnabled = false;

            const blob = await adminUserService.exportUsersExcel({ keyword: searchText, isEnabled });
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `KhachHang_DLMStore_${dayjs().format('DDMMYYYY')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            message.success({ content: 'Xuất file thành công!', key: 'exporting' });
        } catch (error) {
            message.error({ content: 'Lỗi khi xuất file', key: 'exporting' });
        }
    };

    return {
        users, loading, stats,
        filterStatus, setFilterStatus,
        searchText, setSearchText,
        detailVisible, setDetailVisible,
        userDetail, detailLoading,
        fetchUsers, fetchStats, fetchUserDetail,
        toggleStatus, exportExcel
    };
};