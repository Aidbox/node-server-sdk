import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

export type TAgentConfig = Pick<AxiosRequestConfig, 'baseURL' | 'auth'>;

export type TAgent = AxiosInstance;

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
    retryCondition: () => {
      console.log('Awaiting aidbox server...');
      return true;
    },
  });
};

export { axiosRetry };
