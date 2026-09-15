import { ApiResponse } from '../../types/admin.types';

export interface AiContentRequest {
    productName?: string;
    specificationsJson?: string;
    imageUrls?: string[];
}

export interface AiSpecExtractRequest {
    rawText?: string;
    attributesInfo?: string;
}

export interface AiAccessoryRequest {
    productName?: string;
    specificationsJson?: string;
    imageUrls?: string[];
    rawText?: string;
}

export interface IAdminAiService {
    generateDescription(data: AiContentRequest): Promise<string>; 
    extractSpecs(data: AiSpecExtractRequest): Promise<ApiResponse<any>>;
    generateAccessoryDescription(data: AiAccessoryRequest): Promise<string>;
    extractAccessorySpecs(data: AiAccessoryRequest): Promise<string>;
}