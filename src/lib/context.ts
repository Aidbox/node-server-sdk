import { AxiosRequestConfig } from 'axios';

import { TContext } from '../types';

import { TAgent } from './http';

export const makeContext = (agent: TAgent): TContext => {
  const request = (config: AxiosRequestConfig, jsonOverride = true) => {
    return agent.request({
      ...config,
      responseType: jsonOverride ? 'json' : 'text',
    });
  };

  const psql = async <T = any>(query: string): Promise<readonly T[]> => {
    const response = await request({
      url: '/$psql',
      method: 'post',
      data: { query },
    });
    return response.data[0].result;
  };

  return { request, psql };
};
