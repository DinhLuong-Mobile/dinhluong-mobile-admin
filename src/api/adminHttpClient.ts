import { API_CONFIG } from '../config/api.config';
import { adminAuthStorage } from '../services/storage/adminAuthStorage';
import { IHttpClient, RequestConfig } from './IHttpClient';

interface ApiError {
    message?: string;
    code?: number;
    [key: string]: unknown;
}

// Biến cục bộ quản lý hàng đợi Refresh Token
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

class AdminHttpClient implements IHttpClient {
    
    private async fetchWithAuth(url: string, options: RequestInit, isRetry = false): Promise<Response> {
        const authData = adminAuthStorage.getUser();
        
        if (authData?.token) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${authData.token}`
            };
        }

        let response = await fetch(url, options);

        if (response.status === 401 && !isRetry && authData?.refreshToken) {
            if (isRefreshing) {
                try {
                    const token = await new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    
                    options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
                    return await fetch(url, options);
                } catch (err) {
                    return Promise.reject(err);
                }
            }

            isRefreshing = true;

            try {
                console.log("Token hết hạn, đang âm thầm lấy token mới...");
                const refreshUrl = `${API_CONFIG.BASE_URL}/${API_CONFIG.AUTH.REFRESH_TOKEN}`;
                const refreshRes = await fetch(refreshUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: authData.refreshToken })
                });

                const refreshData = await refreshRes.json();

                if (refreshRes.ok && refreshData.code === 200) {
                    const newToken = refreshData.data.accessToken || refreshData.data.token;
                    authData.token = newToken;
                    adminAuthStorage.setUser(authData)
                    processQueue(null, newToken);

                    options.headers = { ...options.headers, 'Authorization': `Bearer ${newToken}` };
                    response = await fetch(url, options);
                } else {
                    throw new Error("Refresh token bị từ chối");
                }
            } catch (error) {
                processQueue(error, null);
                adminAuthStorage.removeUser();
                window.dispatchEvent(new Event('auth_expired'));
                
                if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
                    window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                }
            } finally {
                isRefreshing = false;
            }
        }

        return response;
    }

    private async requestMutation<TResponse, TBody = unknown>(
        method: string, 
        endpoint: string, 
        data?: TBody, 
        config?: RequestConfig
    ): Promise<TResponse> {
        
        const isFormData = data instanceof FormData;
        const headers: Record<string, string> = { ...config?.headers };
        
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const body = isFormData ? (data as unknown as BodyInit) : JSON.stringify(data);

        const response = await this.fetchWithAuth(`${API_CONFIG.BASE_URL}/${endpoint}`, {
            method,
            headers,
            body: data ? body : undefined,
        });

        const responseData = await response.json();

        if (!response.ok || (responseData.code && responseData.code !== 200)) {
            const errorData = responseData as ApiError;
            throw new Error(errorData.message || `${method} request failed`);
        }

        return responseData as TResponse;
    }

    public async get<TResponse>(endpoint: string, config?: RequestConfig): Promise<TResponse> {
        let url = `${API_CONFIG.BASE_URL}/${endpoint}`;

        if (config?.params) {
            let queryString: string ;
            if (config.paramsSerializer) {
                queryString = config.paramsSerializer(config.params);
            } else {
                const validParams: Record<string, string> = {};
                Object.keys(config.params).forEach(key => {
                    const value = config.params[key];
                    if (value !== undefined && value !== null && value !== '') {
                        validParams[key] = String(value);
                    }
                });
                queryString = new URLSearchParams(validParams).toString();
            }
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const response = await this.fetchWithAuth(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...config?.headers, 
            },
        });

        const responseData = await response.json();

        if (!response.ok || (responseData.code && responseData.code !== 200)) {
            const errorData = responseData as ApiError;
            throw new Error(errorData.message || 'Get data failed');
        }

        return responseData as TResponse;
    }

    public async post<TResponse, TBody = unknown>(endpoint: string, data: TBody, config?: RequestConfig): Promise<TResponse> {
        return this.requestMutation<TResponse, TBody>('POST', endpoint, data, config);
    }

    public async put<TResponse, TBody = unknown>(endpoint: string, data: TBody, config?: RequestConfig): Promise<TResponse> {
        return this.requestMutation<TResponse, TBody>('PUT', endpoint, data, config);
    }

    public async delete<TResponse>(endpoint: string, config?: RequestConfig): Promise<TResponse> {
        return this.requestMutation<TResponse>('DELETE', endpoint, undefined, config);
    }
}

const adminHttpClient = new AdminHttpClient();

export default adminHttpClient;