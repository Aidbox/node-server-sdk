import { AxiosRequestConfig, AxiosResponse } from 'axios';

export type ProcessEnv = {
  readonly [key: string]: string | undefined;
};

// eslint-disable-next-line functional/no-mixed-type
export type TContext = {
  readonly request: <T>(
    config: AxiosRequestConfig,
    jsonOverride: boolean
  ) => Promise<AxiosResponse<T>>;
  psql<T = any>(query: string): Promise<readonly T[]>;
};

export type TOperationHandler = (
  ctx: TContext,
  msq: TMessage
) => Promise<{
  readonly status?: number;
  readonly resource?: any;
  readonly headers?: Record<string, string>;
  readonly body?: string;
}>;

export type TOperation = {
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  readonly path: readonly string[];
  readonly handler: TOperationHandler;
};

export type TRawManifest = {
  readonly resources?: any;
  readonly entities?: any;
  readonly operations: {
    readonly [key: string]: TOperation;
  };
  readonly subscriptions: {
    readonly [key: string]: {
      readonly handler: TSubscriptionHandler;
    };
  };
};

export type TPatchedManifest = TRawManifest & {
  readonly subscriptions: {
    readonly [key: string]: { readonly handler: string };
  };
};

export type TSubscriptionHandler = (
  context: TContext,
  message: TMessage
) => any;

export type TSubscriptionHandlers = {
  readonly [key: string]: TSubscriptionHandler;
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
