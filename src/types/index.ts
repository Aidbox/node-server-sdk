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

export type TQueryResponse<T> = {
    error?: string;
    query: string;
    params: any[];
    rows: T[];
    rowsCount: number;
};

/**
 * Default context type will be extend if you define your specific context helpers by provided type
 */
export type TContext<T = Record<string, never>> = {
    readonly request: <T>(config: AxiosRequestConfig, jsonOverride?: boolean) => Promise<AxiosResponse<T>>;
    readonly psql: <T>(query: string) => Promise<readonly T[]>;
    readonly log: (data: TLogData) => Promise<any>;
    readonly query: <T = any>(query: string, params?: any[]) => Promise<TQueryResponse<T>>;
    readonly getAppConfig: () => Partial<TConfig>;
} & T;

export type TOperationHandler<T = Record<string, never>> = (
    ctx: TContext<T>,
    msq: TOperationMessage
) => Promise<{
    readonly status?: number;
    readonly resource?: any;
    readonly headers?: Record<string, string>;
    readonly text?: string;
}>;

export type TOperation<T = Record<string, never>> = {
    readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    readonly path: ReadonlyArray<string | { readonly name: string }>;
    readonly handler: TOperationHandler<T>;
};

export type TRawManifest<T = Record<string, never>> = {
    readonly resources?: any;
    readonly entities?: any;
    readonly operations?: Record<string, TOperation<T>>;
    readonly subscriptions?: Record<string, TSubscription<T>>;
};

export type TPatchedManifest<T = Record<string, never>> = TRawManifest<T> & {
    readonly subscriptions: {
        readonly [key: string]: { readonly handler: string };
    };
};

export type TSubscription<T = Record<string, never>> = {
    readonly handler: TSubscriptionHandler<T>;
};
export type TSubscriptionHandler<T = Record<string, never>> = (
    context: TContext<T>,
    message: TSubscriptionMessage
) => any;

export type TSubscriptionHandlers<T = Record<string, never>> = {
    readonly [key: string]: TSubscriptionHandler<T>;
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
    readonly PGUSER?: string;
    readonly PGPORT?: string;
    readonly PGHOST?: string;
    readonly PGDATABASE?: string;
    readonly PGPASSWORD?: string;
};

export type TConfigKey = keyof TConfig;

export type TConfigKeys = readonly TConfigKey[];

export enum EAccept {
    TEXT = 'text/plain',
    YAML = 'text/yaml',
    JSON = 'application/json',
}

export enum EMessageType {
    OPERATION = 'operation',
    SUBSCRIPTION = 'subscription',
}

export type TMessage = {
    readonly type: EMessageType;
    readonly request: {
        readonly resource: any;
        readonly text: string;
        readonly headers: Record<string, string>;
        readonly params: Record<string, string>;
        readonly 'form-params': Record<string, string>;
        readonly 'route-params': Record<string, string>;
        readonly 'oauth/user': Record<string, any>;
        readonly 'oauth/client': Record<string, any>;
    };
    readonly box: Record<string, string>;
    readonly handler: string;
};

export type TSubscriptionMessage = TMessage & {
    readonly event: {
        readonly resource: any;
        readonly action: string;
        readonly tx: any;
    };
};

export type TOperationMessage = TMessage & {
    readonly operation: {
        readonly app: Record<string, string>;
        readonly action: string;
        readonly module: string;
        readonly request: readonly string[];
        readonly id: string;
        readonly w: null;
    };
};
