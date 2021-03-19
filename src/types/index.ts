export type ProcessEnv = {
  readonly [key: string]: string | undefined;
};

export type IContext = {
  readonly request: any;
};

export type TRawManifest = {
  readonly resources?: any;
  readonly entities?: any;
  readonly operations: {
    readonly [key: string]: {
      readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
      readonly path: readonly string[];
      readonly handler: () => Promise<{ readonly resource: any }>;
    };
  };
  readonly subscriptions: {
    readonly [key: string]: {
      readonly handler: () => boolean;
    };
  };
};

export type TPatchedManifest = TRawManifest & {
  readonly subscriptions: {
    readonly [key: string]: { readonly handler: string };
  };
};

export type TSubscriptionHandler = (a: any, b: any) => any;

export type TSubscriptionHandlers = {
  readonly [key: string]: TSubscriptionHandler;
};

export type ServerConfig = {
  readonly APP_DEBUG: string;
  readonly AIDBOX_URL: string;
  readonly AIDBOX_CLIENT_ID: string;
  readonly AIDBOX_CLIENT_SECRET: string;
  readonly APP_ID: string;
  readonly APP_URL: string;
  readonly APP_PORT: string;
  readonly APP_SECRET: string;
  readonly PGUSER: string;
  readonly PGHOST: string;
  readonly PGDATABASE: string;
  readonly PGPASSWORD: string;
};
