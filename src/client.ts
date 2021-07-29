import assert from "assert";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export type TClientProps = {
  aidboxUrl?: string;
  aidboxClientId?: string;
  aidboxClientSecret?: string;
};

export type TClient = AxiosInstance;

export type TClientRequest = TClient["request"];

export type TClientRequestProps = AxiosRequestConfig;

export const createClient = (props: TClientProps = {}): TClient => {
  const { aidboxClientId, aidboxClientSecret, aidboxUrl } = props;

  assert.ok(aidboxClientId, "aidboxClientId required");
  assert.ok(aidboxClientSecret, "aidboxClientSecret required");
  assert.ok(aidboxUrl, "aidboxUrl required");

  return axios.create({
    baseURL: aidboxUrl,
    auth: {
      username: aidboxClientId,
      password: aidboxClientSecret,
    },
  });
};
