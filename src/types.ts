import { AxiosInstance, AxiosRequestConfig } from "axios";
import Koa from "koa";
import { Server } from "http";

export type OperationMessage<T extends OperationRequestType = any> = {
  type: "operation";
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

export type OperationRequest<
  TOperationRequestType extends OperationRequestType
> = {
  resource?: TOperationRequestType["resource"];
  "oauth/user": Record<string, any>;
  "oauth/client": Record<string, any>;
  params: TOperationRequestType["params"];
  "form-params"?: TOperationRequestType["form-params"];
  "route-params": TOperationRequestType["route-params"];
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

export type Manifest<
  TResourceTypeMap extends ResourceTypeMap = ResourceTypeMap,
  THelpers extends Helpers = {}
> = Omit<
  AppResource,
  "operations" | "subscriptions" | "resourceType" | "type"
> &
  Partial<{
    operations?: ManifestOperations<TResourceTypeMap, THelpers>;
    subscriptions?: ManifestSubscriptions<TResourceTypeMap, THelpers>;
  }>;

export type ManifestProps<
  TResourceTypeMap extends ResourceTypeMap = ResourceTypeMap,
  THelpers extends Helpers = {}
> = Partial<
  Pick<
    Manifest<TResourceTypeMap, THelpers>,
    "apiVersion" | "operations" | "subscriptions" | "entities" | "resources"
  >
>;

export type ManifestOperations<
  TResourceTypeMap extends ResourceTypeMap,
  THelpers extends Helpers
> = Record<string, ManifestOperation<TResourceTypeMap, THelpers>>;

export type ManifestOperation<
  TResourceTypeMap extends ResourceTypeMap,
  THelpers extends Helpers = {},
  TOperationRequestType extends OperationRequestType = any
> = AppResourceOperation & {
  handlerFn: (
    request: OperationRequest<TOperationRequestType>,
    props: DispatchProps<TResourceTypeMap, THelpers>
  ) => Promise<DispatchOutput>;
};

// Subscriptions

export type ManifestSubscriptions<
  TResourceTypeMap extends ResourceTypeMap,
  THelpers extends Helpers
> = Record<string, ManifestSubscription<TResourceTypeMap, THelpers>>;

export type ManifestSubscription<
  TResourceTypeMap extends ResourceTypeMap = ResourceTypeMap,
  THelpers extends Helpers = {},
  TResource extends Resource = any
> = AppResourceSubscription & {
  handlerFn: (
    subscriptionEvent: SubscriptionEvent<TResource>,
    props: DispatchProps<TResourceTypeMap, THelpers>
  ) => Promise<DispatchOutput>;
};

export type DispatchProps<
  TResourceTypeMap extends ResourceTypeMap = ResourceTypeMap,
  THelpers extends Helpers = {}
> = {
  ctx: Ctx<TResourceTypeMap, THelpers>;
  helpers: THelpers;
};

export type DispatchOutput = {
  readonly status?: number;
  readonly resource?: any;
  readonly headers?: Record<string, string>;
  readonly text?: string;
};

export type CtxProps<
  TResourceTypeMap extends ResourceTypeMap,
  THelpers extends Helpers = {}
> = {
  config: BaseConfig;
  manifest: ManifestProps<TResourceTypeMap, THelpers>;
};

export type ResourceTypeMap = Record<string, any>;
export type ResourceType<
  TResourceTypeMap extends ResourceTypeMap = ResourceTypeMap
> = keyof TResourceTypeMap;
export type ResourceByType<
  TResourceTypeMap extends ResourceTypeMap,
  TResourceType extends ResourceType<TResourceTypeMap>
> = TResourceTypeMap[TResourceType];

export type Ctx<
  TResourceTypeMap extends ResourceTypeMap,
  THelpers extends Helpers = {}
> = {
  client: Client;
  manifest: Manifest<TResourceTypeMap, THelpers>;
  log: LogHandler;
  request: RequestHandler;
  api: Api<TResourceTypeMap>;
  fhirApi: Api<TResourceTypeMap>;
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

export type Api<TResourceTypeMap extends ResourceTypeMap = ResourceTypeMap> = {
  createResource<TResourceType extends ResourceType<TResourceTypeMap>>(
    resourceType: TResourceType,
    data: Partial<ResourceByType<TResourceTypeMap, TResourceType>>
  ): Promise<ResourceByType<TResourceTypeMap, TResourceType>>;
  patchResource<TResourceType extends ResourceType<TResourceTypeMap>>(
    resourceType: TResourceType,
    resourceId: string,
    data: Partial<ResourceByType<TResourceTypeMap, TResourceType>>
  ): Promise<ResourceByType<TResourceTypeMap, TResourceType>>;
  deleteResource<TResourceType extends ResourceType<TResourceTypeMap>>(
    resourceType: TResourceType,
    resourceId: string
  ): Promise<ResourceByType<TResourceTypeMap, TResourceType>>;
  getResource<TResourceType extends ResourceType<TResourceTypeMap>>(
    resourceType: TResourceType,
    resourceId: string
  ): Promise<ResourceByType<TResourceTypeMap, TResourceType>>;
  findResources<TResourceType extends ResourceType<TResourceTypeMap>>(
    resourceType: TResourceType,
    params?: any
  ): Promise<{
    resources: Array<ResourceByType<TResourceTypeMap, TResourceType>>;
    total: number;
  }>;
  createBundle: (
    type: Bundle["type"],
    data: Bundle["entry"]
  ) => Promise<BundleResponse>;
};

export type RequestHandler = ClientRequest;
export type App<
  TResourceTypeMap extends ResourceTypeMap = ResourceTypeMap,
  THelpers extends Helpers = {}
> = Koa<any, { ctx: Ctx<TResourceTypeMap, THelpers> }>;
export type BundledApp<TResourceTypeMap extends ResourceTypeMap> = {
  app: App<TResourceTypeMap>;
  server: Server;
};

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

export interface CreateConfigOptions {
  envFilePath?: string;
  envs: ProcessEnv;
}

export interface BaseConfig {
  app: {
    id: string;
    secret: string;
    port: number;
    url: string;
    maxBodySize: string;
    callbackURL: string;
  };
  aidbox: {
    url: string;
    client: string;
    secret: string;
  };
}

export type Helpers = Record<string, Function>;

export type AidboxNodeSDK<
  TResourceTypeMap extends ResourceTypeMap = ResourceTypeMap,
  THelpers extends Helpers = {}
> = {
  createCtx: (
    props: CtxProps<TResourceTypeMap, THelpers>
  ) => Ctx<TResourceTypeMap, THelpers>;
  createApp: (
    dispatchProps: DispatchProps<TResourceTypeMap, THelpers>,
    config: BaseConfig
  ) => BundledApp<TResourceTypeMap>;
  startApp: (
    { app, server }: BundledApp<TResourceTypeMap>,
    port: number
  ) => Promise<Server>;
  createOperation: <TOperationRequestType extends OperationRequestType = any>(
    operation: ManifestOperation<
      TResourceTypeMap,
      THelpers,
      TOperationRequestType
    >
  ) => ManifestOperation<TResourceTypeMap, THelpers, TOperationRequestType>;
  createSubscription: <TResource extends Resource = any>(
    subscription: ManifestSubscription<TResourceTypeMap, THelpers, TResource>
  ) => ManifestSubscription<TResourceTypeMap, THelpers, TResource>;
};
