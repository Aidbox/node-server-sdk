import assert from "assert";
import {
  DispatchOutput,
  DispatchProps,
  Message,
  OperationMessage,
  SubscriptionMessage,
} from "./types";

const debug = require("debug")("@aidbox/node-app:dispatch");

export const dispatch = async (
  message: Message,
  dispatchProps: DispatchProps
): Promise<DispatchOutput> => {
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
  request: OperationMessage["request"],
  dispatchProps: DispatchProps
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
  event: SubscriptionMessage["event"],
  dispatchProps: DispatchProps
) => {
  debug("Dispatching subscription %O", subscriptionId);
  const subscriptions = dispatchProps.ctx.manifest.subscriptions;
  assert.ok(subscriptions, "Manifest has no subscriptions");
  const subscription = subscriptions[subscriptionId];
  assert.ok(subscription, `Subscription ${subscriptionId} not found`);
  return subscription.handlerFn(event, dispatchProps);
};
