import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminMasterDataService, MasterDataRequest } from '../interfaces/IAdminMasterDataService';
import type { SpecGroup, SpecGroupRequest, SpecAttribute, SpecAttributeRequest } from '../../types/spec.types';
import type { ApiResponse } from '../../types/common.types';
import type { Brand, BrandRequest } from '../../types/brand.types';

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
        return this.httpClient.get<ApiResponse<Brand[]>>(API_CONFIG.ADMIN.BRANDS.BASE);
    }

    async createBrand(data: BrandRequest) {
        return this.httpClient.post<ApiResponse<Brand>>(API_CONFIG.ADMIN.BRANDS.BASE, data);
    }

    async updateBrand(id: number | string, data: BrandRequest) {
        return this.httpClient.put<ApiResponse<Brand>>(API_CONFIG.ADMIN.BRANDS.BY_ID(id), data);
    }

    async deleteBrand(id: number | string) {
        return this.httpClient.delete<ApiResponse<string>>(API_CONFIG.ADMIN.BRANDS.BY_ID(id));
    }

    // 3. Spec Groups
   async getSpecGroups() {
        return this.httpClient.get<ApiResponse<SpecGroup[]>>(API_CONFIG.ADMIN.SPEC_GROUPS.BASE);
    }

    async createSpecGroup(data: SpecGroupRequest) {
        return this.httpClient.post<ApiResponse<SpecGroup>>(API_CONFIG.ADMIN.SPEC_GROUPS.BASE, data);
    }

    async updateSpecGroup(id: number | string, data: SpecGroupRequest) {
        return this.httpClient.put<ApiResponse<SpecGroup>>(API_CONFIG.ADMIN.SPEC_GROUPS.BY_ID(id), data);
    }

    async deleteSpecGroup(id: number | string) {
        return this.httpClient.delete<ApiResponse<string>>(API_CONFIG.ADMIN.SPEC_GROUPS.BY_ID(id));
    }

    // --- SPEC ATTRIBUTES ---
    async createSpecAttribute(data: SpecAttributeRequest) {
        return this.httpClient.post<ApiResponse<SpecAttribute>>(API_CONFIG.ADMIN.SPEC_ATTRIBUTES.BASE, data);
    }

    async updateSpecAttribute(id: number | string, data: SpecAttributeRequest) {
        return this.httpClient.put<ApiResponse<SpecAttribute>>(API_CONFIG.ADMIN.SPEC_ATTRIBUTES.BY_ID(id), data);
    }

    async deleteSpecAttribute(id: number | string) {
        return this.httpClient.delete<ApiResponse<string>>(API_CONFIG.ADMIN.SPEC_ATTRIBUTES.BY_ID(id));
    }
}