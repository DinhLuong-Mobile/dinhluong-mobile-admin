export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

// 1. Gom chung thành 1 Interface User duy nhất và đầy đủ
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  typeAccount?: string;
  token: string;
  role?: string; 
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  timestamp: string;
  data: T;
}

// 2. LoginResponse bây giờ bọc kiểu User
export type LoginResponse = ApiResponse<User>;