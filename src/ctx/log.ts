import { TClient } from "../client";

export type TLogFn = (data: TLogData) => Promise<void>;

export type TLogData = {
  message: Record<string, any>;
  type?: string;
  v?: string;
  fx?: string;
};

export const createLog =
  (client: TClient): TLogFn =>
  (data) => {
    return client.request({ url: `/$loggy`, method: "POST", data });
  };
