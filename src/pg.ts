import { Pool, PoolConfig } from "pg";

export type TPg = Pool;

export type TPgProps = PoolConfig;

export const createPg = (props: TPgProps = {}): TPg => {
  return new Pool(props);
};
