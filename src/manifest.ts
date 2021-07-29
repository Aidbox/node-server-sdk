import assert from "assert";
import {
  TAppResource,
  TAppResourceOperation,
  TAppResourceSubscription,
} from "./aidbox";
import { TCtx } from "./ctx";
import { TOperationMessageRequest, TSubscriptionMessageEvent } from "./message";

export type TManifestProps = Partial<
  {
    appId: string;
    appSecret: string;
    appUrl: string;
  } & Pick<TManifest, "operations" | "subscriptions" | "entities" | "resources">
>;

export type TManifestOperations = Record<string, TManifestOperation>;

export type TManifestOperation<R = any, H = any> = TAppResourceOperation & {
  handlerFn: TManifestOperationHandlerFn<R, H>;
};

export type TManifestOperationHandlerFn<R, H> = (
  ctx: TCtx,
  req: TOperationMessageRequest<R>,
  helpers: H
) => Promise<TManifestHandlerOutput>;

export type TManifestSubscriptions = Record<string, TManifestSubscription>;

export type TManifestSubscription<T = any> = TAppResourceSubscription & {
  handlerFn: TManifestSubscriptionHandlerFn<T>;
};

export type TManifestSubscriptionHandlerFn<T> = (
  ctx: TCtx,
  event: TSubscriptionMessageEvent<T>
) => Promise<TManifestHandlerOutput>;

export type TManifestHandlerOutput = {
  readonly status?: number;
  readonly resource?: any;
  readonly headers?: Record<string, string>;
  readonly text?: string;
};

export type TManifest = Omit<
  TAppResource,
  "operations" | "subscriptions" | "resourceType" | "type"
> &
  Partial<{
    operations?: TManifestOperations;
    subscriptions?: TManifestSubscriptions;
  }>;

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
