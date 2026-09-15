// src/service/order.service.ts

const BASE_URL = 'http://localhost:8080/api/admin/orders';

const getAuthToken = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr).token : '';
};

const getHeaders = (isJson = false) => ({
    Authorization: `Bearer ${getAuthToken()}`,
    ...(isJson && { 'Content-Type': 'application/json' }),
});

export const orderService = {

    // 1. Lấy danh sách đơn hàng (🔥 ĐÃ THÊM PHÂN TRANG)
    getOrders: async (status: string, keyword: string) => {
        const queryParams = new URLSearchParams({
            status,
            keyword
        }).toString();

        const response = await fetch(`${BASE_URL}?${queryParams}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        const json = await response.json();

        if (response.ok && json.status === 'success') {
            return json.data; // Trả về mảng trực tiếp
        }

        throw new Error(json.message || 'Không thể tải danh sách đơn hàng');
    },

    // 2. 🔥 Lấy thống kê đơn hàng cho Mini Dashboard
    getOrderStats: async () => {
        const response = await fetch(`${BASE_URL}/stats`, {
            method: 'GET',
            headers: getHeaders(),
        });

        const json = await response.json();

        if (response.ok && json.status === 'success') {
            return json.data;
        }

        throw new Error(json.message || 'Không thể tải thống kê đơn hàng');
    },

    // 3. Cập nhật trạng thái 1 đơn hàng (Giữ nguyên)
    updateOrderStatus: async (
        orderId: number,
        status: string,
        reason?: string
    ) => {
        const response = await fetch(
            `${BASE_URL}/${orderId}/status`,
            {
                method: 'PUT',
                headers: getHeaders(true),
                body: JSON.stringify({
                    status,
                    reason: reason || null
                }),
            }
        );

        const json = await response.json();

        if (response.ok && json.status === 'success') {
            return json.data;
        }

        throw new Error(json.message || 'Không thể cập nhật trạng thái');
    },

    // 4. 🔥 Cập nhật trạng thái HÀNG LOẠT (Bulk Actions)
    updateBulkStatus: async (
        orderIds: number[],
        newStatus: string,
        reason?: string
    ) => {
        const response = await fetch(`${BASE_URL}/bulk-status`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({
                orderIds,
                newStatus,
                reason: reason || null
            }),
        });

        const json = await response.json();

        if (response.ok && json.status === 'success') {
            return json.data;
        }

        throw new Error(json.message || 'Không thể cập nhật hàng loạt');
    },

    // 5. Export Excel (Giữ nguyên)
    exportExcel: async (status: string, keyword: string) => {

        const queryParams = new URLSearchParams({
            status,
            keyword
        }).toString();

        const response = await fetch(
            `${BASE_URL}/export?${queryParams}`,
            {
                method: 'GET',
                headers: getHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error('Không thể xuất Excel');
        }

        const blob = await response.blob();

        // xử lý download luôn tại service
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;

        link.download = `orders_${status}_${Date.now()}.xlsx`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);
    }
};