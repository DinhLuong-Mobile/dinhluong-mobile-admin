export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthData {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  typeAccount: string;
  token: string;
  role?: string; // Bổ sung dòng này
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  timestamp: string;
  data: T;
}
export interface User {
  name: string;
  token?: string;
}

export type LoginResponse = ApiResponse<AuthData>;
