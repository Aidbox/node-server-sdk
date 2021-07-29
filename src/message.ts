export type TOperationMessage<T = any> = {
  type: "operation";
  request: TOperationMessageRequest<T>;
  operation: {
    id: string;
  };
};

export type TOperationMessageRequest<T> = {
  resource?: T;
  params: Record<string, string>;
  "route-params": Record<string, string>;
  headers: Record<string, string>;
};

export type TSubscriptionMessage<T = any> = {
  type: "subscription";
  handler: string;
  event: TSubscriptionMessageEvent<T>;
};

export type TSubscriptionMessageEvent<T> = {
  resource: T;
  previous?: T;
  action: "create" | "update";
};

export type TMessage = TOperationMessage | TSubscriptionMessage;
