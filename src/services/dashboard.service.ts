// src/services/dashboard.service.ts

// Hàm hỗ trợ lấy Token
const getAuthToken = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).token : '';
};

// Cấu hình Header mặc định
const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
});

const BASE_URL = 'http://localhost:8080/api/admin/dashboard';

// Helper function để tạo query string gọn gàng hơn
const buildQueryString = (timeFilter: string, customDates?: [string, string] | null) => {
    let query = `?time=${timeFilter}`;
    // Nếu chọn custom và có mảng ngày tháng truyền vào
    if (timeFilter === 'custom' && customDates && customDates.length === 2) {
        query += `&startDate=${customDates[0]}&endDate=${customDates[1]}`;
    }
    return query;
};

export const dashboardService = {
    // 1. Hàm lấy dữ liệu thống kê
    getDashboardData: async (timeFilter: string, customDates?: [string, string] | null) => {
        const queryStr = buildQueryString(timeFilter, customDates);
        const response = await fetch(`${BASE_URL}${queryStr}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        
        const json = await response.json();
        if (response.ok && json.status === 'success') {
            return json.data;
        } else {
            throw new Error(json.message || "Lỗi từ server");
        }
    },

    // 2. Hàm gọi API lấy file Excel (luồng byte)
    exportExcel: async (timeFilter: string, customDates?: [string, string] | null) => {
        const queryStr = buildQueryString(timeFilter, customDates);
        const response = await fetch(`${BASE_URL}/export${queryStr}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error("Lỗi tải file từ server");
        }
        
        // Trả về dữ liệu dạng Blob (File)
        return await response.blob();
    },
    
    // 3. Hàm gọi API AI phân tích dữ liệu
    getAiInsights: async (timeFilter: string, customDates?: [string, string] | null) => {
        const queryStr = buildQueryString(timeFilter, customDates);
        const response = await fetch(`${BASE_URL}/ai-insights${queryStr}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        
        const json = await response.json();
        if (response.ok && json.status === 'success') {
            return json.data; 
        } else {
            throw new Error(json.message || "Lỗi từ server khi gọi AI phân tích");
        }
    }
};