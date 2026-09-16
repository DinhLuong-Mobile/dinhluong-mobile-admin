    import { IHttpClient } from '../../api/IHttpClient';
    import { API_CONFIG } from '../../config/api.config';
    import { IAdminProductService } from '../interfaces/IAdminProductService';
    import type { ApiResponse } from '../../types/common.types';
 import type {  PageableResponse, ProductCardResponse, BulkStockUpdateRequest } from '../../types/product.types';
    export class AdminProductService implements IAdminProductService {
        constructor(private readonly httpClient: IHttpClient) {}

        async getProducts(params?: any) {
            return this.httpClient.get<ApiResponse<PageableResponse<ProductCardResponse>>>(
                API_CONFIG.ADMIN.PRODUCTS.BASE,
                { params }
            );
        }

        async getProductById(id: number | string) {
            return this.httpClient.get<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCTS.BY_ID(id)
            );
        }

        async getProductVariants(id: number | string) {
            return this.httpClient.get<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCTS.VARIANTS(id)
            );
        }

        async getOverviewStats() {
            return this.httpClient.get<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCTS.OVERVIEW_STATS
            );
        }

        async createProduct(formData: FormData) {
            return this.httpClient.post<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCTS.BASE,
                formData
            );
        }

        async updateProduct(id: number | string, formData: FormData) {
            return this.httpClient.put<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCTS.BY_ID(id),
                formData
            );
        }

        async deleteProduct(id: number | string) {
            return this.httpClient.delete<ApiResponse<string>>(
                API_CONFIG.ADMIN.PRODUCTS.BY_ID(id)
            );
        }

        async toggleStatus(id: number | string) {
            return this.httpClient.put<ApiResponse<string>>(
                API_CONFIG.ADMIN.PRODUCTS.TOGGLE_STATUS(id),
                {}
            );
        }

        async toggleFeatured(id: number | string) {
            return this.httpClient.put<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCTS.TOGGLE_FEATURED(id),
                {}
            );
        }

        async updateBulkStock(data: BulkStockUpdateRequest) {
            return this.httpClient.put<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCTS.BULK_STOCK,
                data
            );
        }

        async uploadImage(formData: FormData) {
            return this.httpClient.post<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCTS.UPLOAD_IMAGE,
                formData
            );
        }

        async importExcel(formData: FormData) {
            return this.httpClient.post<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCTS.IMPORT_EXCEL,
                formData
            );
        }

        async exportExcel(params?: any) {
            return this.httpClient.get<Blob>(
                API_CONFIG.ADMIN.PRODUCTS.EXPORT_EXCEL,
                { 
                    params,
                    responseType: 'blob', 
                    headers: { 'Accept': 'application/octet-stream' }
                }
            );
        }

        // Combos implementation
        async createCombo(data: any) {
            return this.httpClient.post<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCT_COMBOS.BASE,
                data
            );
        }

        async getCombosByMainProduct(mainProductId: number | string) {
            return this.httpClient.get<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCT_COMBOS.BY_MAIN_PRODUCT(mainProductId)
            );
        }

        async deleteCombo(id: number | string) {
            return this.httpClient.delete<ApiResponse<any>>(
                API_CONFIG.ADMIN.PRODUCT_COMBOS.BY_ID(id)
            );
        }
    }