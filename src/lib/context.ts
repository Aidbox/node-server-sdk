/**
 * Helpers for work with context object which will be passed in all operation handlers
 *
 * @module Context
 */

import { AxiosRequestConfig } from 'axios';

import { TContext } from '../types';

import { TAgent } from './agent';

export const createContext = <CH>(
  agent: TAgent,
  contextHelpers: CH
): TContext<CH> => {
  const request = (config: AxiosRequestConfig, jsonOverride = true) => {
    return agent.request({
      ...config,
      responseType: jsonOverride ? 'json' : 'text',
    });
  };

  const psql = async <T>(query: string): Promise<readonly T[]> => {
    const response = await request({
      url: '/$psql',
      method: 'post',
      data: { query },
    });
    return response.data[0].result;
  };

  return { request, psql, ...contextHelpers };
};
