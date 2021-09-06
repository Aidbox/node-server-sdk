import { QueryResult } from "pg";
import { TPg } from "../pg";
import { TLogFn } from "./log";

export type TQueryFn = <T>(
  query: string,
  params?: Array<any>
) => Promise<TQueryResult<T>>;

export type TQueryResult<T> = QueryResult<T>;

export const createQuery =
  (pg: TPg, log: TLogFn): TQueryFn =>
  async (query, params) => {
    log({ message: { query, params }, type: "sql", fx: "sql-query" });
    return pg.query(query, params);
  };
