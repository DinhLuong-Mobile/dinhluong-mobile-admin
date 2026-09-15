// src/types/product.types.ts

// 1. Inner Classes (Map từ Inner DTOs của Java)
export interface SpecDto {
  icon: string;
  label: string;
  subLabel: string;
}

export interface ColorDto {
  hex: string;
}

export interface VariantDto {
  label: string;
  active: boolean;
}

// 2. Main Product Response (Map từ ProductCardResponse)
export interface Product {
  id: number;
  slug:string; // Backend: id (là slug)
  name: string;
  image: string; // Backend: image
  price: number; // Backend: BigDecimal -> number
  originalPrice: number;
  discountNote?: string; // Backend có thể null -> thêm dấu ?
  installmentText?: string;

  // Lists
  specs: SpecDto[];
  colors: ColorDto[];
  variants: VariantDto[];
  promotions: string[];
  promotionText?: string;
}

// 3. Page Structure (Cấu trúc trả về của Spring Data Page)
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page index
  last: boolean; // True nếu là trang cuối
}

// 4. API Wrapper (Map từ class ApiResponse)
export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  timestamp: string;
  data: T;
}

// ==========================================
// --- CÁC TYPE MỚI (Dùng cho Detail) ---
// ==========================================

export interface HighlightSpec {
  label: string;
  value: string;
  icon: string;
}

export interface ColorOption {
  name: string;
  hex: string;
  img: string;
}

export interface VariantDetail {
  id: number | string;
  sku: string;
  rom: string;
  colorName: string;
  price: number;
  stock: number;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface SpecGroup {
  id: number | string;
  title: string;
  items: SpecItem[];
}

// Map đúng với JSON "data" của API Product Detail
export interface ProductDetail {
  id: number | string; // Có thể là Long hoặc String tùy backend trả về ID hay Slug ở field này
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discountNote?: string;
  installmentText?: string;
  description: string;
  thumbnail: string;
  productImages: string[];
  highlightSpecs: HighlightSpec[];
  storageOptions: string[];
  colorOptions: ColorOption[];
  variants: VariantDetail[];
  specsData: SpecGroup[];
  promotions: string[];
}

// Định nghĩa item phụ (Sim, Bảo hành, Quà tặng...)
export interface CartComboItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  checked: boolean; // Để user tích chọn mua kèm hay không
  type?: "gift" | "service" | "sim"; // (Tùy chọn) Để phân loại icon
}

// Định nghĩa Item chính trong giỏ hàng
export interface CartItem {
  // --- Thông tin định danh ---
  id: number | string; 
  productVariantId: number | string; // ID sản phẩm
  sku: string; // Quan trọng: Mã SKU để phân biệt phiên bản (VD: IP15-256-BLUE)

  // --- Thông tin hiển thị ---
  name: string;
  slug: string; // Để link quay lại trang chi tiết
  image: string; // Ảnh đại diện (theo màu đã chọn)

  // --- Thông tin giá & Biến thể ---
  price: number;
  originalPrice?: number;
  colorName: string; // Màu khách đã chọn (VD: "Titan Sa Mạc")
  rom?: string; // Dung lượng (nếu cần hiển thị)

  // --- Trạng thái (UI State) ---
  quantity: number; // Số lượng khách mua
  checked: boolean; // Checkbox chọn thanh toán
  stockQuantity: number; // Số lượng tồn kho (để disable checkbox nếu hết hàng)
  // --- Dữ liệu lồng nhau ---
  combos?: CartComboItem[]; // Danh sách ưu đãi mua kèm
}

// Định nghĩa tổng quan cho đơn hàng (Dùng cho component OrderSummary)
export interface CartSummary {
  totalPrice: number; // Tổng tiền hàng
  totalDiscount: number; // Tổng giảm giá
  finalPrice: number; // Khách cần trả
  totalItems: number; // Tổng số lượng sản phẩm
}

export interface ProductFilterParams {
  category?: string;
  search?: string;
  brands?: string[];
  os?: string[];
  roms?: string[];
  rams?: string[];
  networks?: string[];
  minPrice?: number;
  maxPrice?: number;
  minBattery?: number;
  maxBattery?: number; // <-- Mới
  minScreenSize?: number;
  maxScreenSize?: number; // <-- Mới
  minRefreshRate?: number;
  maxRefreshRate?: number;
}

export interface ComboProduct {
  id: number;           // ID combo
  relatedProductId: number; // ID sản phẩm phụ
  name: string;
  image: string;
  price: string;        // "450.000đ"
  oldPrice: string;     // "500.000đ"
  saving: string;       // "Tiết kiệm: 50.000đ"
  rawPrice: number;     // 450000 (để tính toán nếu cần)
  rawDiscount: number;
}

// Type cho phản hồi API Combo
export type ComboResponse = ComboProduct[];
