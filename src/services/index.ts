import adminHttpClient from '../api/adminHttpClient';

// Import Implementations
import { AdminAuthService } from './implementations/AdminAuthService'; 
import { AdminDashboardService } from './implementations/AdminDashboardService';
import { AdminProductService } from './implementations/AdminProductService';
import { AdminOrderService } from './implementations/AdminOrderService';
import { AdminPaymentService } from './implementations/AdminPaymentService';
import { AdminUserService } from './implementations/AdminUserService';
import { AdminMasterDataService } from './implementations/AdminMasterDataService';
import { AdminVoucherService } from './implementations/AdminVoucherService';
import { AdminReviewService } from './implementations/AdminReviewService';
import { AdminChatService } from './implementations/AdminChatService';
import { AdminAiService } from './implementations/AdminAiService';

// Khởi tạo các instance (Inject httpClient vào)
export const adminAuthService = new AdminAuthService(adminHttpClient);
export const adminDashboardService = new AdminDashboardService(adminHttpClient);
export const adminProductService = new AdminProductService(adminHttpClient);
export const adminOrderService = new AdminOrderService(adminHttpClient);
export const adminPaymentService = new AdminPaymentService(adminHttpClient);
export const adminUserService = new AdminUserService(adminHttpClient);
export const adminMasterDataService = new AdminMasterDataService(adminHttpClient);
export const adminVoucherService = new AdminVoucherService(adminHttpClient);
export const adminReviewService = new AdminReviewService(adminHttpClient);
export const adminChatService = new AdminChatService(adminHttpClient);
export const adminAiService = new AdminAiService(adminHttpClient);