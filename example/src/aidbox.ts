import { MyResourceTypeMap } from "./aidbox-types";
import { getTypedAidboxNodeSdk } from "@aidbox/node-server-sdk";
import { Helpers } from "./helpers";

export const {
  createCtx,
  createApp,
  startApp,
  createOperation,
  createSubscription,
} = getTypedAidboxNodeSdk<MyResourceTypeMap, Helpers>();
