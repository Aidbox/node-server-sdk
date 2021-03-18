  export type ProcessEnv = {
    readonly [key: string]: string | undefined;
  }

  export type IContext = {
    readonly request: any
  };

export type InitManifest ={
  readonly resources?:any;
  readonly entities?:any;
  readonly operations:{
    readonly [key: string]:{
      readonly method: "GET" |  "POST" | "PATCH" | "PUT" | "DELETE";
      readonly path: readonly string[];
      readonly handler: () => Promise<{readonly resource: any}>

    }
  }
  readonly subscriptions:{
    readonly [key:string]:{
      readonly handler: () => boolean
    }
  }
}


export type ServerConfig = {
    readonly APP_DEBUG: string | undefined;
    readonly AIDBOX_URL: string | undefined;
    readonly AIDBOX_CLIENT_ID: string | undefined;
    readonly AIDBOX_CLIENT_SECRET: string | undefined;
    readonly APP_ID: string | undefined;
    readonly APP_URL: string | undefined;
    readonly APP_PORT: string | undefined;
    readonly APP_SECRET: string | undefined;
    readonly PGUSER: string | undefined;
    readonly PGHOST: string | undefined;
    readonly PGDATABASE: string | undefined;
    readonly PGPASSWORD: string | undefined;
  };
