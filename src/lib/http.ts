import http, { RequestListener, Server } from 'http';

import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

import { TConfig } from '../types';

export type TServer = Server;
export type TAgent = AxiosInstance;

export const createServer = (dispatch: RequestListener): TServer =>
  http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/aidbox') {
      dispatch(req, res);
      return;
    }
    res.end(`Ready`);
  });

export const startServer = (
  server: TServer,
  port = 8090,
  hostname = '0.0.0.0'
): Promise<TServer> => {
  return new Promise((resolve, reject) => {
    server
      // wrap
      .on('error', reject)
      .listen(port, hostname, () => {
        console.log(`server started on http://0.0.0.0:8090`);
        resolve(server);
      });
  });
};

export const createAgent = (config: TConfig): TAgent => {
  const clientInstance = axios.create({
    baseURL: config.AIDBOX_URL,
    auth: {
      username: config.AIDBOX_CLIENT_ID,
      password: config.AIDBOX_CLIENT_SECRET,
    },
  });
  //  clientInstance.interceptors.response.use(
  //     (response) => {
  //       return response;
  //     },
  //     (error) => {
  //       return Promise.reject(error);
  //     },
  //   );
  axiosRetry(clientInstance, {
    retries: 10,
    retryCondition: (error) => {
      console.log('wait while aidbox will be ready');
      return error.config.url === '/__healthcheck';
    },
    retryDelay: (retryCount) => {
      return retryCount * 1000;
    },
  });
  return clientInstance;
};
