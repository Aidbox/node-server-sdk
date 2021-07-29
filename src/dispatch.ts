import assert from "assert";
import { TCtx } from "./ctx";
import { TManifestHandlerOutput } from "./manifest";
import { TMessage } from "./message";

const debug = require("debug")("@aidbox/server-sdk:dispatch");

export const dispatch = async (
  ctx: TCtx,
  message: TMessage,
  helpers?: any
): Promise<TManifestHandlerOutput> => {
  if (message.type === "operation") {
    const operationId = message.operation.id;
    assert.ok(ctx.manifest.operations, "Manifest has no operations");
    const operation = ctx.manifest.operations[operationId];
    debug("Dispatching operation %O", operationId);
    assert.ok(operation, `Operation ${operationId} not found`);
    const handlerFn = operation.handlerFn;
    return handlerFn(ctx, message.request, helpers);
  } else {
    const subscriptionId = message.handler;
    assert.ok(ctx.manifest.subscriptions, "Manifest has no subscriptions");
    const subscription = ctx.manifest.subscriptions[subscriptionId];
    debug("Dispatching subscription %O", subscriptionId);
    assert.ok(subscription, `Subscription ${subscriptionId} not found`);
    const handlerFn = subscription.handlerFn;
    return handlerFn(ctx, message.event);
  }
};
