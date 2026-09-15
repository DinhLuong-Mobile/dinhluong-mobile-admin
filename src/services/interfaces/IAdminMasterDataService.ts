import { ApiResponse } from '../../types/admin.types';

export interface MasterDataRequest {
    name: string;
    description?: string;
    slug?: string;
    thumbnailUrl?: string;
    parentId?: number;
    level?: number;
}

export interface SpecRequest {
    name: string;
    sortOrder?: number;
    groupId?: number;
    dataType?: string;
}

export interface IAdminMasterDataService {
    // Categories
    getCategories(): Promise<ApiResponse<any>>;
    createCategory(data: MasterDataRequest): Promise<ApiResponse<any>>;
    updateCategory(id: number | string, data: MasterDataRequest): Promise<ApiResponse<any>>;
    deleteCategory(id: number | string): Promise<ApiResponse<any>>;

    // Brands
    getBrands(): Promise<ApiResponse<any>>;
    createBrand(data: MasterDataRequest): Promise<ApiResponse<any>>;
    updateBrand(id: number | string, data: MasterDataRequest): Promise<ApiResponse<any>>;
    deleteBrand(id: number | string): Promise<ApiResponse<any>>;

    // Spec Groups
    getSpecGroups(): Promise<ApiResponse<any>>;
    createSpecGroup(data: SpecRequest): Promise<ApiResponse<any>>;
    updateSpecGroup(id: number | string, data: SpecRequest): Promise<ApiResponse<any>>;
    deleteSpecGroup(id: number | string): Promise<ApiResponse<any>>;

    // Spec Attributes
    createSpecAttribute(data: SpecRequest): Promise<ApiResponse<any>>;
    updateSpecAttribute(id: number | string, data: SpecRequest): Promise<ApiResponse<any>>;
    deleteSpecAttribute(id: number | string): Promise<ApiResponse<any>>;
}