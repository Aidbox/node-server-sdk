/**
 * Define http client.\
 * By default, we use **axios** for send http request to aidbox

 * @module Agent
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

export type TAgentConfig = Pick<AxiosRequestConfig, 'baseURL' | 'auth'>;

export type TAgent = AxiosInstance;

/**
 * Create default agent which we will use for work with aidbox.
 */

export const createAgent = (config: TAgentConfig): TAgent => {
  const agent = axios.create(config);
  applyRetry(agent);
  return agent;
};

export const applyRetry = (agent: TAgent) => {
  axiosRetry(agent, {
    retries: 10,
    retryDelay: (retryCount) => {
      return retryCount * 1000;
    },
    retryCondition: (error) => {
      if (error.config.url === '/__healthcheck') {
        console.log('Awaiting aidbox server...');
        return true;
      }
      return false;
    },
  });
};

export { axiosRetry };

export const awaitAidbox = async (agent: TAgent) => {
  await agent.request({
    url: '/__healthcheck',
    responseType: 'text',
  });
};
