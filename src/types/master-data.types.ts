export interface MasterDataRequest {
  name: string;
  description: string;
  slug: string;
  thumbnailUrl?: string;
  parentId?: number;
  level?: number;
}

export interface SpecRequest {
  name: string;
  sortOrder: number;
  groupId?: number;
  dataType?: string;
}