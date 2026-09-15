export interface Overview {
  totalRevenue: number;
  completedOrders: number;
  newUsers: number;
  pendingTasks: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  orders: number;
}

export interface PaymentMethodStat {
  name: string;
  value: number;
  color: string;
}

export interface TopProduct {
  id: number;
  name: string;
  variant: string;
  sold: number;
  revenue: number;
  image: string;
}

export interface LowStockVariant {
  sku: string;
  name: string;
  variant: string;
  stock: number;
  image: string;
}

export interface TopBrand {
  name: string;
  revenue: number;
  fill: string;
}

export interface ActiveVoucher {
  code: string;
  used: number;
  limit: number;
  expiry: string;
}

export interface SupportStats {
  chatbotHandled: number;
  humanHandled: number;
  avgRating: number;
}

export interface CancellationStat {
  reason: string;
  count: number;
}

export interface BusinessPerformance {
  conversionRate: number;
  returnRate: number;
  lostRevenue: number;
}

export interface DashboardResponse {
  overview: Overview;
  revenueTrends: RevenueTrend[];
  paymentMethods: PaymentMethodStat[];
  topProducts: TopProduct[];
  lowStockVariants: LowStockVariant[];
  topBrands: TopBrand[];
  activeVouchers: ActiveVoucher[];
  supportStats: SupportStats;
  cancellationStats: CancellationStat[];
  performance: BusinessPerformance;
}