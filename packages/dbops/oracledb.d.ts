declare module "oracledb" {
  export interface ConnectionAttributes {
    user?: string;
    password?: string;
    connectString?: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
    connectTimeout?: number;
  }

  export interface ExecuteOptions {
    outFormat?: number;
    autoCommit?: boolean;
  }

  export interface ExecuteResult {
    rows?: any[];
    metaData?: any[];
  }

  export interface Connection {
    execute(
      sql: string,
      binds?: any,
      options?: ExecuteOptions,
    ): Promise<ExecuteResult>;
    close(): Promise<void>;
  }

  export interface Pool {
    getConnection(): Promise<Connection>;
    close(): Promise<void>;
  }

  export function createPool(config: ConnectionAttributes): Promise<Pool>;

  export function getConnection(
    config: ConnectionAttributes,
  ): Promise<Connection>;

  export let fetchAsString: number[];
  export let outFormat: number;

  export const OBJECT: number;
  export const STRING: number;
  export const NUMBER: number;
  export const DATE: number;
  export const CURSOR: number;
  export const BUFFER: number;
  export const CLOB: number;
  export const BLOB: number;
  export const OUT_FORMAT_OBJECT: number;
}
