export type GristFields = Record<string, any>;

export interface GristRecord {
  id: number;
  fields: GristFields;
}

export interface GristRecordsResponse {
  records: GristRecord[];
}

export interface GristRecordId {
  id: number;
}

export interface GristRecordIdsResponse {
  records: GristRecordId[];
}

export interface GristRecordCreateItem {
  fields: GristFields;
}

export interface GristRecordUpdateItem {
  id: number;
  fields: GristFields;
}

export interface GristRecordsCreateRequest {
  records: GristRecordCreateItem[];
}

export interface GristRecordsUpdateRequest {
  records: GristRecordUpdateItem[];
}
