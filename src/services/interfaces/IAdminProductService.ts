import { ApiResponse, PageableResponse, ProductCardResponse, BulkStockUpdateRequest } from '../../types/admin.types';

export interface IAdminProductService {
    getProducts(params?: {
        productType?: string;
        keyword?: string;
        status?: string;
        brandId?: number;
        categoryId?: number;
        page?: number;
        size?: number;
    }): Promise<ApiResponse<PageableResponse<ProductCardResponse>>>;

    getProductById(id: number | string): Promise<ApiResponse<any>>;
    getProductVariants(id: number | string): Promise<ApiResponse<any>>;
    getOverviewStats(): Promise<ApiResponse<any>>;

    createProduct(formData: FormData): Promise<ApiResponse<any>>;
    updateProduct(id: number | string, formData: FormData): Promise<ApiResponse<any>>;
    deleteProduct(id: number | string): Promise<ApiResponse<string>>;

    toggleStatus(id: number | string): Promise<ApiResponse<string>>;
    toggleFeatured(id: number | string): Promise<ApiResponse<any>>;
    updateBulkStock(data: BulkStockUpdateRequest): Promise<ApiResponse<any>>;

    uploadImage(formData: FormData): Promise<ApiResponse<any>>;
    importExcel(formData: FormData): Promise<ApiResponse<any>>;
    exportExcel(params?: any): Promise<Blob>;

    // Combos
    createCombo(data: any): Promise<ApiResponse<any>>;
    getCombosByMainProduct(mainProductId: number | string): Promise<ApiResponse<any>>;
    deleteCombo(id: number | string): Promise<ApiResponse<any>>;
}