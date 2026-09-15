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
