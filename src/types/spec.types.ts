
export interface SpecAttribute {
    id: number;
    name: string;
    dataType: 'STRING' | 'NUMBER' | 'BOOLEAN';
    sortOrder: number;
    groupId?: number;
}

export interface SpecGroup {
    id: number;
    name: string;
    sortOrder: number;
    attributes?: SpecAttribute[];
}

export type SpecGroupRequest = Omit<SpecGroup, 'id' | 'attributes'>;
export type SpecAttributeRequest = Omit<SpecAttribute, 'id'>;