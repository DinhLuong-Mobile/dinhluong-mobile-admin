export interface Category {
    id: number;
    name: string;
    slug: string;
    parentId?: number | null;
    level?: number;
    thumbnailUrl?: string;
    description?: string;
    children?: Category[];
}

export type CategoryRequest = Omit<Category, 'id' | 'children'> & {
    parentId?: number | null;
};