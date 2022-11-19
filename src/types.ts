import { AxiosInstance, AxiosRequestConfig } from "axios";
import Koa from "koa";
import { Server } from "http";

export type OperationMessage<T = any> = {
  type: "operation";
  // @ts-ignore
  request: OperationRequest<T>;
  operation: {
    id: string;
  };
};

export type OperationRequestType = {
  resource?: Record<string, any>;
  params?: Record<string, any>;
  "form-params"?: Record<string, any>;
  "route-params"?: Record<string, any>;
};

export type OperationRequest<T extends OperationRequestType> = {
  resource?: T["resource"];
  "oauth/user": Record<string, any>;
  "oauth/client": Record<string, any>;
  params: T["params"];
  "form-params"?: T["form-params"];
  "route-params": T["route-params"];
  headers: Record<string, string>;
};

export type SubscriptionMessage<T = any> = {
  type: "subscription";
  handler: string;
  event: SubscriptionEvent<T>;
};

export type SubscriptionEvent<T> = {
  resource: T;
  previous?: T;
  action: "create" | "update" | "delete";
};

export type Message = OperationMessage | SubscriptionMessage;

export type ClientProps = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
};

export type Client = AxiosInstance;

export type ClientRequest = Client["request"];

export type ClientRequestProps = AxiosRequestConfig;

export type Resource<T = unknown> = {
  resourceType: string;
  id: string;
} & T;

export type AppResource = Resource<{
  apiVersion: number;
  type: string;
  endpoint: {
    url: string;
    type: string;
    secret: string;
  };
  operations?: Record<string, AppResourceOperation>;
  subscriptions?: Record<string, AppResourceSubscription>;
  entities?: Record<string, AppResourceEntity>;
  resources?: Record<string, {}>;
}>;

export type AppResourceOperation = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: (string | { name: string })[];
};

export type AppResourceSubscription = {
  handler: string;
};

export type AppResourceEntity = {
  desc?: string;
  attrs: Record<string, any>;
};

export type Manifest = Omit<
  AppResource,
  "operations" | "subscriptions" | "resourceType" | "type"
> &
  Partial<{
    operations?: ManifestOperations;
    subscriptions?: ManifestSubscriptions;
  }>;

export type ManifestProps = Partial<
  Pick<
    Manifest,
    "apiVersion" | "operations" | "subscriptions" | "entities" | "resources"
  >
>;

export type ManifestOperations = Record<string, ManifestOperation>;

export type ManifestOperation<
  T extends OperationRequestType = any,
  U = any
> = AppResourceOperation & {
  handlerFn: (
    request: OperationRequest<T>,
    props: DispatchProps<U>
  ) => Promise<DispatchOutput>;
};

// Subscriptions

export type ManifestSubscriptions = Record<string, ManifestSubscription>;

export type ManifestSubscription<
  T extends Resource = any,
  U = any
> = AppResourceSubscription & {
  handlerFn: (
    subscriptionEvent: SubscriptionEvent<T>,
    props: DispatchProps<U>
  ) => Promise<DispatchOutput>;
};

export type DispatchProps<H = any> = {
  ctx: Ctx;
  helpers: H;
};

export type DispatchOutput = {
  readonly status?: number;
  readonly resource?: any;
  readonly headers?: Record<string, string>;
  readonly text?: string;
};

export type CtxProps = {
  config: BaseConfig;
  manifest: ManifestProps;
};

export type Ctx = {
  client: Client;
  manifest: Manifest;
  log: LogHandler;
  request: RequestHandler;
  api: Api;
  fhirApi: Api;
  sql: <T = any>(
    query: string,
    params?: (string | number)[]
  ) => Promise<{
    result: T[];
    duration: number;
    status: string;
    query: string;
  }>;
  psql: <T = any>(query: string) => Promise<T[]>;
};

export type Bundle = {
  resourceType: "Bundle";
  type: "batch" | "transaction" | "collection";
  entry: Array<{
    request: {
      method: "PUT" | "POST" | "PATCH" | "DELETE";
      url: string;
    };
    resource: Partial<Resource>;
  }>;
};

export type BundleResponse = {
  id: string;
  type: "batch-response" | "transaction-response";
  resourceType: "Bundle";
  resource: Array<any>;
};

export type Api = {
  createResource<T>(resourceType: string, data: Partial<T>): Promise<T>;
  patchResource<T>(
    resourceType: string,
    resourceId: string,
    data: Partial<T>
  ): Promise<T>;
  deleteResource<T>(resourceType: string, resourceId: string): Promise<T>;
  getResource<T>(resourceType: string, resourceId: string): Promise<T>;
  findResources<T>(
    resourceType: string,
    params?: any
  ): Promise<{ resources: T[]; total: number }>;
  createBundle: (
    type: Bundle["type"],
    data: Bundle["entry"]
  ) => Promise<BundleResponse>;
};

export type RequestHandler = ClientRequest;

export type LogHandler = (data: LogData) => void;

export type LogData = {
  message: Record<string, any>;
  type?: string;
  v?: string;
  fx?: string;
};

export interface ProcessEnv {
  [key: string]: string | undefined;
}

export interface ConfigSchemaProps {
  env: string;
  default?: string | number;
  type: "string" | "number";
  required?: boolean;
  stripSlashes?: boolean;
}

export interface ConfigSchema {
  [key: string]: ConfigSchema | ConfigSchemaProps;
}

export type BaseConfig = {
  app: {
    id: string;
    secret: string;
    port: number;
    url: string;
    maxBodySize: number;
    callbackURL: string;
  };
  aidbox: {
    url: string;
    client: string;
    secret: string;
  };
};
