import { createApi, createFHIRApi } from "../api";
import { createClient } from "../client";
import { createManifest } from "../manifest";
import { createLog } from "./log";
import { createRequest } from "./request";
import {
  AidboxNodeSDK,
  Client,
  ClientProps,
  Ctx,
  CtxProps,
  ManifestProps,
  ResourceType,
  ResourceTypeMap,
} from "../types";

export const createCtx: AidboxNodeSDK["createCtx"] = ({
  config,
  manifest: initManifest,
}) => {
  const manifest = createManifest(initManifest, config);
  const client = createClient(config.aidbox);
  const log = createLog(client);
  const request = createRequest(client);
  const api = createApi(client);
  const fhirApi = createFHIRApi(client);
  const psql = <T>(query: string) => {
    return request<T>({ url: "/$psql", method: "POST", data: { query } }).then(
      (res) => res.data
    );
  };
  const sql = <T>(query: string, params?: (string | number)[]) => {
    return request<T>({
      url: "/$sql",
      method: "POST",
      data: [query, ...(params || [])],
    }).then((res) => res.data);
  };

  return {
    manifest,
    client,
    log,
    request,
    api,
    fhirApi,
    psql,
    sql,
  };
};
