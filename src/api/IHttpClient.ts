export interface RequestConfig {
    params?: any;
    headers?: Record<string, string>;
    paramsSerializer?: (params: any) => string;
    responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
}

export interface IHttpClient {
    get<TResponse>(endpoint: string, config?: RequestConfig): Promise<TResponse>;
    post<TResponse, TBody = unknown>(endpoint: string, data: TBody, config?: RequestConfig): Promise<TResponse>;
    put<TResponse, TBody = unknown>(endpoint: string, data: TBody, config?: RequestConfig): Promise<TResponse>;
    delete<TResponse>(endpoint: string, config?: RequestConfig): Promise<TResponse>;
}