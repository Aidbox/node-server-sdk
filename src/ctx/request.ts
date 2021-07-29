import { TClient, TClientRequest, TClientRequestProps } from "../client";

export type TRequestFn = TClientRequest;

export const createRequest =
  (client: TClient): TRequestFn =>
  (props: TClientRequestProps) => {
    return client.request(props);
  };
