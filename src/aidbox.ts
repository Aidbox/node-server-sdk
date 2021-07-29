export type TResource<T = unknown> = {
  resourceType: string;
  id: string;
} & T;

export type TAppResource = TResource<{
  apiVersion: number;
  type: string;
  endpoint: TAppResourceEndpoint;
  operations?: Record<string, TAppResourceOperation>;
  subscriptions?: Record<string, TAppResourceSubscription>;
  entities?: Record<string, TAppResourceEntity>;
  resources?: Record<string, {}>;
}>;

export type TAppResourceEndpoint = {
  url: string;
  type: string;
  secret: string;
};

export type TAppResourceOperation = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: (string | { name: string })[];
};

export type TAppResourceSubscription = {
  handler: string;
};

export type TAppResourceEntity = {
  attrs: Record<string, any>;
};

export type TPatientResource = TResource<{
  active: boolean;
}>;
