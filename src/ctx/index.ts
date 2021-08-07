import R from "ramda";
import { createApi, TApi } from "../api";
import { createClient, TClient, TClientProps } from "../client";
import { createManifest, TManifest, TManifestProps } from "../manifest";
import { createPg, TPg, TPgProps } from "../pg";
import { createLog, TLogFn } from "./log";
import { createQuery, TQueryFn } from "./query";
import { createRequest, TRequestFn } from "./request";

export type TCtxProps = Partial<{
  client: TClientProps;
  pg: TPgProps;
  manifest: TManifestProps;
}>;

export type TCtx = {
  client: TClient;
  manifest: TManifest;
  pg: TPg;
  log: TLogFn;
  query: TQueryFn;
  request: TRequestFn;
  api: TApi;
};

export const createCtx = (props: TCtxProps = {}): TCtx => {
  props = getCtxProps(props);

  const manifest = createManifest(props.manifest);
  const client = createClient(props.client);
  const pg = createPg(props.pg);

  const log = createLog(client);
  const request = createRequest(client);
  const query = createQuery(pg, log);
  const api = createApi(client);

  return {
    manifest,
    client,
    pg,
    log,
    request,
    query,
    api,
  };
};

export const getCtxProps = (props: TCtxProps = {}): TCtxProps => {
  const defaultProps: TCtxProps = {
    client: getClientProps(),
    manifest: getManifestProps(),
    pg: getPgProps(),
  };
  return R.mergeDeepRight<TCtxProps, any>(defaultProps, props);
};

export const getManifestProps = (): TManifestProps => ({
  appId: process.env.APP_ID,
  appSecret: process.env.APP_SECRET,
  appUrl: process.env.APP_URL,
});

export const getClientProps = (): TClientProps => ({
  aidboxClientId: process.env.AIDBOX_CLIENT_ID,
  aidboxClientSecret: process.env.AIDBOX_CLIENT_SECRET,
  aidboxUrl: process.env.AIDBOX_URL,
});

export const getPgProps = (): TPgProps => ({
  host: process.env.PGHOST,
  port: +(process.env.PGHOSTPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});
