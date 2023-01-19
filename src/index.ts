export * from "./app";
export * from "./config";
export * from "./ctx";
export * from "./dispatch";
export * from "./errors";
export * from "./manifest";
export * from "./types";

import {
  createApp,
  createOperation,
  createSubscription,
  startApp,
} from "./app";
import { createCtx } from "./ctx";
import { AidboxNodeSDK, Helpers, ResourceTypeMap } from "./types";

export const getTypedAidboxNodeSdk = <
  TResourceTypeMap extends ResourceTypeMap,
  THelpers extends Helpers
>(): AidboxNodeSDK<TResourceTypeMap, THelpers> => {
  return {
    createCtx: createCtx as never,
    createApp,
    startApp,
    createOperation: createOperation as never,
    createSubscription: createSubscription as never,
  };
};

// TODO: aidbox type generator

// TODO: createCtx<AidboxTypes> to typesafe:
// - createResource
// - patchResource
// - deleteResource
// - getResource
// - findResources
// - createBundle

// TODO: createOperation with zod input/output validation

// TODO: createSubscription with zod input/output validation

// TODO: Refactor createConfig to zod validation

// TODO: remove helpers && make context extendable

// Q: What is fhirAPI?

// TODO: Prepare types of operations to be exportable from backend to frontend

// TODO: Add api schema generation
