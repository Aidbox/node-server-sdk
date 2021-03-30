/**
 * Common type definitions
 *
 * @module Type Definition
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';

export type TLogData = {
  readonly message: Record<string, any>;
  readonly type?: string;
  readonly v?: string;
  readonly fx?: string;
};

/**
 * Default context type will be extend if you define your specific context helpers by provided type
 */
export type TContext<CH> = {
  readonly request: <T>(config: AxiosRequestConfig, jsonOverride?: boolean) => Promise<AxiosResponse<T>>;
  readonly psql: <T>(query: string) => Promise<readonly T[]>;
  readonly log: (data: TLogData) => Promise<any>;
} & CH;

export type TOperationHandler<CH> = (
  ctx: TContext<CH>,
  msq: TMessage
) => Promise<{
  readonly status?: number;
  readonly resource?: any;
  readonly headers?: Record<string, string>;
  readonly body?: string;
}>;

export type TOperation<CH> = {
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  readonly path: readonly string[];
  readonly handler: TOperationHandler<CH>;
};

export type TRawManifest<CH = Record<string, never>> = {
  readonly resources?: any;
  readonly entities?: any;
  readonly operations?: Record<string, TOperation<CH>>;
  readonly subscriptions?: Record<string, TSubscription<CH>>;
};

export type TPatchedManifest<CH> = TRawManifest<CH> & {
  readonly subscriptions: {
    readonly [key: string]: { readonly handler: string };
  };
};

export type TSubscription<CH> = {
  readonly handler: TSubscriptionHandler<CH>;
};
export type TSubscriptionHandler<CH> = (context: TContext<CH>, message: TMessage) => any;

export type TSubscriptionHandlers<CH> = {
  readonly [key: string]: TSubscriptionHandler<CH>;
};

export type TConfig = {
  readonly APP_DEBUG: string;
  readonly AIDBOX_URL: string;
  readonly AIDBOX_CLIENT_ID: string;
  readonly AIDBOX_CLIENT_SECRET: string;
  readonly APP_ID: string;
  readonly APP_URL: string;
  readonly APP_PORT: string;
  readonly APP_SECRET: string;
  readonly PGUSER: string;
  readonly PGHOST: string;
  readonly PGDATABASE: string;
  readonly PGPASSWORD: string;
};

export type TConfigKey = keyof TConfig;

export type TConfigKeys = readonly TConfigKey[];

export enum EAccept {
  TEXT = 'text/plain',
  YAML = 'text/yaml',
  JSON = 'application/json',
}

export enum EOperation {
  OPERATION = 'operation',
  SUBSCRIPTION = 'subscription',
}

export type TMessage = {
  readonly type: EOperation;
  readonly request: {
    readonly headers: Record<string, string>;
    readonly params: Record<string, string>;
    readonly 'route-params': Record<string, string>;
    readonly 'oauth/user': Record<string, any>;
    readonly 'oauth/client': Record<string, any>;
  };
  readonly box: Record<string, string>;

  readonly operation?: {
    readonly app: Record<string, string>;
    readonly action: string;
    readonly module: string;
    readonly request: readonly string[];
    readonly id: string;
    readonly w: null;
  };
  readonly handler?: string;
};
