import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminMasterDataService, MasterDataRequest, SpecRequest } from '../interfaces/IAdminMasterDataService';
import type { ApiResponse } from '../../types/admin.types';

export class AdminMasterDataService implements IAdminMasterDataService {
    constructor(private readonly httpClient: IHttpClient) {}

    // 1. Categories
    async getCategories() {
        return this.httpClient.get<ApiResponse<any>>(API_CONFIG.ADMIN.CATEGORIES.BASE);
    }

    async createCategory(data: MasterDataRequest) {
        return this.httpClient.post<ApiResponse<any>>(API_CONFIG.ADMIN.CATEGORIES.BASE, data);
    }

    async updateCategory(id: number | string, data: MasterDataRequest) {
        return this.httpClient.put<ApiResponse<any>>(API_CONFIG.ADMIN.CATEGORIES.BY_ID(id), data);
    }

    async deleteCategory(id: number | string) {
        return this.httpClient.delete<ApiResponse<any>>(API_CONFIG.ADMIN.CATEGORIES.BY_ID(id));
    }

    // 2. Brands
    async getBrands() {
        return this.httpClient.get<ApiResponse<any>>(API_CONFIG.ADMIN.BRANDS.BASE);
    }

    async createBrand(data: MasterDataRequest) {
        return this.httpClient.post<ApiResponse<any>>(API_CONFIG.ADMIN.BRANDS.BASE, data);
    }

    async updateBrand(id: number | string, data: MasterDataRequest) {
        return this.httpClient.put<ApiResponse<any>>(API_CONFIG.ADMIN.BRANDS.BY_ID(id), data);
    }

    async deleteBrand(id: number | string) {
        return this.httpClient.delete<ApiResponse<any>>(API_CONFIG.ADMIN.BRANDS.BY_ID(id));
    }

    // 3. Spec Groups
    async getSpecGroups() {
        return this.httpClient.get<ApiResponse<any>>(API_CONFIG.ADMIN.SPEC_GROUPS.BASE);
    }

    async createSpecGroup(data: SpecRequest) {
        return this.httpClient.post<ApiResponse<any>>(API_CONFIG.ADMIN.SPEC_GROUPS.BASE, data);
    }

    async updateSpecGroup(id: number | string, data: SpecRequest) {
        return this.httpClient.put<ApiResponse<any>>(API_CONFIG.ADMIN.SPEC_GROUPS.BY_ID(id), data);
    }

    async deleteSpecGroup(id: number | string) {
        return this.httpClient.delete<ApiResponse<any>>(API_CONFIG.ADMIN.SPEC_GROUPS.BY_ID(id));
    }

    // 4. Spec Attributes
    async createSpecAttribute(data: SpecRequest) {
        return this.httpClient.post<ApiResponse<any>>(API_CONFIG.ADMIN.SPEC_ATTRIBUTES.BASE, data);
    }

    async updateSpecAttribute(id: number | string, data: SpecRequest) {
        return this.httpClient.put<ApiResponse<any>>(API_CONFIG.ADMIN.SPEC_ATTRIBUTES.BY_ID(id), data);
    }

    async deleteSpecAttribute(id: number | string) {
        return this.httpClient.delete<ApiResponse<any>>(API_CONFIG.ADMIN.SPEC_ATTRIBUTES.BY_ID(id));
    }
}