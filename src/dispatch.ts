import assert from "assert";
import { TCtx } from "./ctx";
import { TMessage } from "./message";

const debug = require("debug")("@aidbox/server-sdk:dispatch");

export type TDispatchProps<H = any> = {
  ctx: TCtx;
  helpers: H;
};

export type TDispatchOutput = {
  readonly status?: number;
  readonly resource?: any;
  readonly headers?: Record<string, string>;
  readonly text?: string;
};

export const dispatch = async (
  message: TMessage,
  dispatchProps: TDispatchProps
): Promise<TDispatchOutput> => {
  const ctx = dispatchProps.ctx;
  if (message.type === "operation") {
    const operationId = message.operation.id;
    assert.ok(ctx.manifest.operations, "Manifest has no operations");
    const operation = ctx.manifest.operations[operationId];
    debug("Dispatching operation %O", operationId);
    assert.ok(operation, `Operation ${operationId} not found`);
    const operationHandlerFn = operation.handlerFn;
    return operationHandlerFn(message.request, dispatchProps);
  } else {
    const subscriptionId = message.handler;
    assert.ok(ctx.manifest.subscriptions, "Manifest has no subscriptions");
    const subscription = ctx.manifest.subscriptions[subscriptionId];
    debug("Dispatching subscription %O", subscriptionId);
    assert.ok(subscription, `Subscription ${subscriptionId} not found`);
    const subscriptionHandlerFn = subscription.handlerFn;
    return subscriptionHandlerFn(message.event, dispatchProps);
  }
};
