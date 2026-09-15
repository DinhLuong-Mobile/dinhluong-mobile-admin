export interface Voucher {
  id: number;
  code: string;
  discount: number;
  discountType: 'PERCENT' | 'FIXED';
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  collectable: boolean;
}