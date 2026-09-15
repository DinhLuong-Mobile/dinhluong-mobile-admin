import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { 
    IAdminAiService, 
    AiContentRequest, 
    AiSpecExtractRequest, 
    AiAccessoryRequest 
} from '../interfaces/IAdminAiService';
import type { ApiResponse } from '../../types/admin.types';

export class AdminAiService implements IAdminAiService {
    constructor(private readonly httpClient: IHttpClient) {}

    async generateDescription(data: AiContentRequest) {
        return this.httpClient.post<string>(
            API_CONFIG.ADMIN.AI.GENERATE_DESCRIPTION,
            data
        );
    }

    async extractSpecs(data: AiSpecExtractRequest) {
        return this.httpClient.post<ApiResponse<any>>(
            API_CONFIG.ADMIN.AI.EXTRACT_SPECS,
            data
        );
    }

    async generateAccessoryDescription(data: AiAccessoryRequest) {
        return this.httpClient.post<string>(
            API_CONFIG.ADMIN.AI.ACCESSORY_GENERATE_DESCRIPTION,
            data
        );
    }

    async extractAccessorySpecs(data: AiAccessoryRequest) {
        return this.httpClient.post<string>(
            API_CONFIG.ADMIN.AI.ACCESSORY_EXTRACT_SPECS,
            data
        );
    }
}