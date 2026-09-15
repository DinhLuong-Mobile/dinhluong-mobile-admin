// src/types/brand.types.ts
export interface Brand {
    id: number;
    name: string;
    slug: string;
    thumbnailUrl?: string;
    description?: string;
}

export type BrandRequest = Omit<Brand, 'id'>;