// src/services/userService.ts

// --- 1. ĐỊNH NGHĨA CÁC INTERFACES ---
export interface UserResponse {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    avatarUrl: string;
    authProvider: string;
    roleName: string;
    isEnabled: boolean;
    createdAt: string;
}

export interface UserDetailResponse extends UserResponse {
    statistics: {
        totalOrders: number;
        cancelledOrders: number;
        totalSpent: number;
    };
    addresses: {
        id: number;
        receiverName: string;
        receiverPhone: string;
        fullAddress: string;
    }[];
    recentOrders: {
        id: number;
        totalAmount: number;
        status: string;
        createdAt: string;
    }[];
}

export interface UserStatsResponse {
    totalUsers: number;
    activeUsers: number;
    lockedUsers: number;
}

export interface ImportUserError {
    row: number;
    email: string;
    message: string;
}

export interface ImportUserReport {
    successCount: number;
    failCount: number;
    errors: ImportUserError[];
}




// --- 2. CẤU HÌNH API GỐC ---
const API_URL = 'http://localhost:8080/api/admin/users';

const getHeaders = () => {
    const userStr = localStorage.getItem('user');
    const token = userStr ? JSON.parse(userStr).token : '';
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// --- 3. EXPORT CÁC HÀM GỌI API ---
export const userService = {
    // Lấy danh sách khách hàng (có tìm kiếm và lọc)
    getUsers: async (keyword: string, filterStatus: string): Promise<UserResponse[]> => {
        const queryParams = new URLSearchParams();
        if (keyword) queryParams.append('keyword', keyword);
        if (filterStatus !== 'ALL') {
            queryParams.append('isEnabled', filterStatus === 'ACTIVE' ? 'true' : 'false');
        }

        const response = await fetch(`${API_URL}?${queryParams.toString()}`, { headers: getHeaders() });
        const json = await response.json();
        
        if (!response.ok || json.status !== 'success') throw new Error(json.message || "Lỗi tải danh sách");
        return json.data;
    },

    // Lấy thống kê tổng quan (Dashboard)
    getUserStats: async (): Promise<UserStatsResponse> => {
        const response = await fetch(`${API_URL}/stats`, { headers: getHeaders() });
        const json = await response.json();
        
        if (!response.ok || json.status !== 'success') throw new Error(json.message);
        return json.data;
    },

    // Lấy chi tiết 1 khách hàng
    getUserDetail: async (userId: number): Promise<UserDetailResponse> => {
        const response = await fetch(`${API_URL}/${userId}`, { headers: getHeaders() });
        const json = await response.json();
        
        if (!response.ok || json.status !== 'success') throw new Error(json.message);
        return json.data;
    },

    // Khóa / Mở khóa tài khoản
    toggleUserStatus: async (userId: number): Promise<string> => {
        const response = await fetch(`${API_URL}/${userId}/toggle-status`, { 
            method: 'PUT', 
            headers: getHeaders() 
        });
        const json = await response.json();
        
        if (!response.ok || json.status !== 'success') throw new Error(json.message);
        return json.message;
    },
    // src/services/userService.ts bổ sung vào object userService:

    exportExcel: async (keyword: string, filterStatus: string): Promise<Blob> => {
        const queryParams = new URLSearchParams();
        if (keyword) queryParams.append('keyword', keyword);
        if (filterStatus !== 'ALL') {
            queryParams.append('isEnabled', filterStatus === 'ACTIVE' ? 'true' : 'false');
        }

        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : '';

        const response = await fetch(`${API_URL}/export?${queryParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Không thể xuất file Excel");
        return await response.blob();
    },
    // Thêm vào cuối đối tượng userService
    importExcel: async (file: File): Promise<{ message: string; data: ImportUserReport }> => {
    const formData = new FormData();
    formData.append('file', file);

    const userStr = localStorage.getItem('user');
    const token = userStr ? JSON.parse(userStr).token : '';

    const response = await fetch(`${API_URL}/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // KHÔNG set Content-Type
        body: formData
    });

    const json = await response.json();
    
    // ApiResponse.success thường trả về code 200 và status "success" (hoặc code == 0 tùy backend của bạn)
    if (!response.ok || json.status !== 'success') {
        throw new Error(json.message || "Lỗi khi nhập dữ liệu từ Excel");
    }
    
    // Trả về cả message và cái Report (chính là json.data)
    return {
        message: json.message,
        data: json.data 
    };
}
};