declare module 'aidbox-server-sdk'{
  export type ProcessEnv = {
    readonly [key: string]: string | undefined;
  }

  export type IContext = {
    readonly request: any
  };

}
