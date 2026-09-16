// File: src/service/productService.ts (DÀNH CHO ADMIN)
import { message } from 'antd';

const API_URL = 'http://localhost:8080/api/admin';

export interface ProductFilterParams {
    page?: number;
    size?: number;
    keyword?: string;
    status?: string;
    brandId?: string;
    categoryId?: string;
    productType?: 'MAIN' | 'ACCESSORY';
}

class AdminProductService {
    private getAuthHeaders() {
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : '';
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Lấy Header dành riêng cho Upload File (Không set Content-Type)
    private getUploadHeaders() {
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : '';
        return {
            Authorization: `Bearer ${token}`
        };
    }
    
    async getProducts(params: ProductFilterParams) {
        const queryParams = new URLSearchParams();
        queryParams.append('page', String((params.page || 1) - 1));
        queryParams.append('size', String(params.size || 10));
        if (params.productType) queryParams.append('productType', params.productType);
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.status && params.status !== 'ALL') queryParams.append('status', params.status);
        if (params.brandId && params.brandId !== 'ALL') queryParams.append('brandId', params.brandId);
        if (params.categoryId && params.categoryId !== 'ALL') queryParams.append('categoryId', params.categoryId);

        const response = await fetch(`${API_URL}/products?${queryParams.toString()}`, {
            headers: this.getAuthHeaders()
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || 'Lỗi tải sản phẩm');
        return json;
    }

    // ==========================================
    // BỔ SUNG: 3 HÀM DÙNG CHO FORM THÊM / SỬA 
    // ==========================================

    async getProductById(id: string | number) {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || 'Lỗi tải chi tiết sản phẩm');
        return json; // Backend trả về kiểu ProductRequest DTO
    }

    async createProduct(formData: FormData) {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: this.getUploadHeaders(), // Phải dùng Header không có Content-Type
            body: formData
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || 'Lỗi khi tạo sản phẩm');
        return json;
    }

    async updateProduct(id: number | string, formData: FormData) {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: this.getUploadHeaders(), // Phải dùng Header không có Content-Type
            body: formData
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || 'Lỗi khi cập nhật sản phẩm');
        return json;
    }

    // ==========================================

    async toggleStatus(productId: number) {
        const response = await fetch(`${API_URL}/products/${productId}/toggle-status`, {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });
        return response.json();
    }

    async toggleFeatured(productId: number) {
        const response = await fetch(`${API_URL}/products/${productId}/toggle-featured`, {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });
        return response.json();
    }

    async deleteProduct(productId: number) {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        if (!response.ok) throw new Error('Xóa sản phẩm thất bại');
        return true;
    }

    async getBrands() {
        const response = await fetch(`${API_URL}/brands`, { headers: this.getAuthHeaders() });
        return response.json();
    }

    async getCategories() {
        const response = await fetch(`${API_URL}/categories`, { headers: this.getAuthHeaders() });
        return response.json();
    }
    async getSpecGroups() {
        const response = await fetch(`${API_URL}/spec-groups`, { headers: this.getAuthHeaders() });
        return response.json();
    }
    async exportExcel(filters: {
    productType?: 'MAIN' | 'ACCESSORY';
    keyword?: string;
    status?: string | null;
    brandId?: string | number | null;
    categoryId?: string | number | null;
}) {

    const params = new URLSearchParams();

    if (filters.productType) {
        params.append('productType', filters.productType);
    }

    if (filters.keyword) {
        params.append('keyword', filters.keyword);
    }

    if (filters.status) {
        params.append('status', filters.status);
    }

    if (filters.brandId) {
        params.append('brandId', String(filters.brandId));
    }

    if (filters.categoryId) {
        params.append('categoryId', String(filters.categoryId));
    }

    const response = await fetch(
        `${API_URL}/products/export?${params.toString()}`,
        {
            headers: this.getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error('Export thất bại');
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = `products_${filters.productType}_${Date.now()}.xlsx`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

    message.success('Export excel thành công');
}

    async getOverviewStats() {
        const response = await fetch(`${API_URL}/products/overview-stats`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || 'Lỗi tải thống kê');
        return { data: json }; 
    }
    async importExcel(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_URL}/products/import`, {
            method: 'POST',
            // QUAN TRỌNG: Dùng getUploadHeaders (KHÔNG có Content-Type) để gửi FormData
            headers: this.getUploadHeaders(), 
            body: formData
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || 'Lỗi khi import file Excel');
        return json;
}
}
// Lưu ý: Ở file ProductCreate và ProductManager, bạn đang gọi là `productService`
// Nên chỗ này tôi đổi lại tên export cho khớp với file cũ để bạn không phải đi tìm sửa từng chỗ import nhé.
export const AdminProductService = new AdminProductService();