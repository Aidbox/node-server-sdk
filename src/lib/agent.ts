import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

export type TAgentConfig = Pick<AxiosRequestConfig, 'baseURL' | 'auth'>;

export type TAgent = AxiosInstance;

export const createAgent = (config: TAgentConfig): TAgent => {
  const clientInstance = axios.create(config);
  axiosRetry(clientInstance, {
    retries: 10,
    retryDelay: (retryCount) => {
      return retryCount * 1000;
    },
    retryCondition: () => {
      console.log('Awaiting aidbox server...');
      return true;
    },
  });
  return clientInstance;
};
