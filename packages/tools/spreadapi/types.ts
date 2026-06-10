export type SpreadApiMethod = "GET" | "POST";

export type IncludeTokenMode = "none" | "query" | "body";

export type JsonObject = Record<string, any>;

export interface ExecuteCalculationRequest {
  serviceUrl: string;
  method?: SpreadApiMethod;
  inputs?: JsonObject;
  query?: JsonObject;
  timeout?: number;
  serviceToken?: string | null;
  includeTokenMode?: IncludeTokenMode;
}

export interface ExecuteCalculationResponse {
  result: any;
  status: number;
  data: any;
}

export interface GetServiceInfoRequest {
  serviceUrl: string;
  infoPath?: string;
  query?: JsonObject;
  timeout?: number;
  serviceToken?: string | null;
  includeTokenMode?: IncludeTokenMode;
}

export interface GetServiceInfoResponse {
  info: any;
  status: number;
  data: any;
}
