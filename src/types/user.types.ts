export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  authProvider: string;
  roleName: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface UserStats {
  totalOrders: number;
  cancelledOrders: number;
  totalSpent: number;
}

export interface UserDetailResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  authProvider: string;
  isEnabled: boolean;
  createdAt: string;
  statistics: UserStats;
  addresses: UserAddress[];
  recentOrders: UserRecentOrder[];
}

export interface UserDashboardStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
}

export interface UserImportError {
  row: number;
  email: string;
  message: string;
}

export interface ImportUserReport {
  successCount: number;
  failCount: number;
  errors: UserImportError[];
}

export interface UserAddress {
    id: number;
    receiverName: string;
    receiverPhone: string;
    fullAddress: string;
}

export interface UserRecentOrder {
    id: number;
    totalAmount: number;
    status: string;
    createdAt: string;
}