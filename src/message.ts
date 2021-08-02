export type TOperationMessage<T = any> = {
  type: "operation";
  request: TOperationRequest<T>;
  operation: {
    id: string;
  };
};

export type TOperationRequestType = {
  resource?: any;
  params?: any;
  "form-params"?: any;
  "route-params"?: any;
};

export type TOperationRequest<T extends TOperationRequestType> = {
  resource?: T["resource"];
  "oauth/user": Record<string, any>;
  "oauth/client": Record<string, any>;
  params: T["params"];
  "form-params"?: T["form-params"];
  "route-params": T["route-params"];
  headers: Record<string, string>;
};

export type TSubscriptionMessage<T = any> = {
  type: "subscription";
  handler: string;
  event: TSubscriptionEvent<T>;
};

export type TSubscriptionEvent<T> = {
  resource: T;
  previous?: T;
  action: "create" | "update";
};

export type TMessage = TOperationMessage | TSubscriptionMessage;
