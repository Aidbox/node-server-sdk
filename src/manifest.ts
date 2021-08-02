import assert from "assert";
import {
  TAppResource,
  TAppResourceOperation,
  TAppResourceSubscription,
  TResource,
} from "./aidbox";
import { TDispatchOutput, TDispatchProps } from "./dispatch";
import {
  TOperationRequest,
  TOperationRequestType,
  TSubscriptionEvent,
} from "./message";

export type TManifest = Omit<
  TAppResource,
  "operations" | "subscriptions" | "resourceType" | "type"
> &
  Partial<{
    operations?: TManifestOperations;
    subscriptions?: TManifestSubscriptions;
  }>;

export type TManifestProps = Partial<
  {
    appId: string;
    appSecret: string;
    appUrl: string;
  } & Pick<
    TManifest,
    "apiVersion" | "operations" | "subscriptions" | "entities" | "resources"
  >
>;

export const createManifest = (props: TManifestProps = {}): TManifest => {
  const { appId, appSecret, appUrl, ...manifest } = props;

  assert.ok(appId, "appId required");
  assert.ok(appSecret, "appSecret required");
  assert.ok(appUrl, "appUrl required");

  return {
    id: appId,
    apiVersion: 1,
    endpoint: {
      type: "http-rpc",
      secret: appSecret,
      url: appUrl,
    },
    ...manifest,
  };
};

// Operations

export type TManifestOperations = Record<string, TManifestOperation>;

export type TManifestOperation<
  T extends TOperationRequestType = any,
  U = any
> = TAppResourceOperation & {
  handlerFn: (
    request: TOperationRequest<T>,
    props: TDispatchProps<U>
  ) => Promise<TDispatchOutput>;
};

// Subscriptions

export type TManifestSubscriptions = Record<string, TManifestSubscription>;

export type TManifestSubscription<
  T extends TResource = any,
  U = any
> = TAppResourceSubscription & {
  handlerFn: (
    subscriptionEvent: TSubscriptionEvent<T>,
    props: TDispatchProps<U>
  ) => Promise<TDispatchOutput>;
};
