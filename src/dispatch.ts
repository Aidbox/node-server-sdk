import assert from "assert";
import { TCtx } from "./ctx";
import { TMessage, TOperationMessage, TSubscriptionMessage } from "./message";

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
  switch (message.type) {
    case "operation":
      return dispatchOperation(
        message.operation.id,
        message.request,
        dispatchProps
      );
    case "subscription":
      return dispatchSubscription(
        message.handler,
        message.event,
        dispatchProps
      );
    default:
      throw new Error("Not implemented");
  }
};

export const dispatchOperation = (
  operationId: string,
  request: TOperationMessage["request"],
  dispatchProps: TDispatchProps
) => {
  debug("Dispatching operation %O", operationId);
  const operations = dispatchProps.ctx.manifest.operations;
  assert.ok(operations, "Manifest has no operations");
  const operation = operations[operationId];
  assert.ok(operation, `Operation ${operationId} not found`);
  return operation.handlerFn(request, dispatchProps);
};

export const dispatchSubscription = (
  subscriptionId: string,
  event: TSubscriptionMessage["event"],
  dispatchProps: TDispatchProps
) => {
  debug("Dispatching subscription %O", subscriptionId);
  const subscriptions = dispatchProps.ctx.manifest.subscriptions;
  assert.ok(subscriptions, "Manifest has no subscriptions");
  const subscription = subscriptions[subscriptionId];
  assert.ok(subscription, `Subscription ${subscriptionId} not found`);
  return subscription.handlerFn(event, dispatchProps);
};
