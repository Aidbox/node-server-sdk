import { RequestListener } from 'http';

import { AxiosRequestConfig } from 'axios';
import yaml from 'js-yaml';
import R from 'ramda';

import {
  ProcessEnv,
  TConfig,
  TContext,
  TPatchedManifest,
  TRawManifest,
  TSubscriptionHandlers,
} from '../types';

import { createAgent, createServer, startServer, TAgent } from './http';

export const prepareConfig = (envs: ProcessEnv): TConfig => {
  const keys = [
    'APP_DEBUG',
    'AIDBOX_URL',
    'AIDBOX_CLIENT_ID',
    'AIDBOX_CLIENT_SECRET',
    'APP_ID',
    'APP_URL',
    'APP_PORT',
    'APP_SECRET',
    'PGUSER',
    'PGHOST',
    'PGDATABASE',
    'PGPASSWORD',
  ];
  return R.pick(keys, envs) as TConfig;
};

const validateConfig = (config: TConfig): { readonly error?: string } => {
  type configKey = keyof typeof config;
  const missingParameters = Object.keys(config)
    .map((key) => {
      const value = config[key as configKey];
      if (value === '' || value === undefined) {
        return key;
      }
      return;
    })
    .filter((k) => k);

  if (Object.keys(missingParameters).length > 0) {
    return { error: `Missing variables ${missingParameters.toString()}` };
  }
  return {};
};

const validateManifest = (manifest: any): { readonly error?: string } => {
  const subs = Object.keys(manifest.subscriptions || {})
    .map((k) => {
      if (typeof manifest.subscriptions[k].handler !== 'function') {
        return `Subscription handler for ${k} is not a function but - ${typeof manifest
          .subscriptions[k].handler}`;
      }
      return undefined;
    })
    .filter((k) => k);
  const ops = Object.keys(manifest.operations || {})
    .map((k) => {
      if (typeof manifest.operations[k].handler !== 'function') {
        return `Operation handler for ${k} is not a function but - ${typeof manifest
          .operations[k].handler}`;
      }
      return undefined;
    })
    .filter((k) => k);
  const ls = [...subs, ...ops];
  return ls.length ? { error: ls.join('\n') } : {};
};

const patchManifest = (
  manifest: TRawManifest
): {
  readonly subscriptionHandlers: TSubscriptionHandlers;
  readonly patchedManifest: TPatchedManifest;
} => {
  const subscriptionHandlers = Object.keys(manifest.subscriptions).reduce(
    (subscriptionHandlers, key) => {
      return {
        ...subscriptionHandlers,
        [`${key}_handler`]: manifest.subscriptions[key].handler,
      };
    },
    {}
  );

  const manifestSubscriptions = Object.keys(manifest.subscriptions).reduce(
    (manifestSubscriptions, key) => {
      return {
        ...manifestSubscriptions,
        [key]: { handler: `${key}_handler` },
      };
    },
    {}
  );

  const patchedManifest = { ...manifest, subscriptions: manifestSubscriptions };

  return {
    subscriptionHandlers,
    patchedManifest,
  };
};

const makeContext = (agent: TAgent): TContext => {
  const request = (config: AxiosRequestConfig, jsonOverride = true) => {
    return agent.request({
      ...config,
      responseType: jsonOverride ? 'json' : 'text',
    });
  };

  return { request };
};

export const startApp = async (
  config: TConfig,
  manifest: TRawManifest
): Promise<void> => {
  const configValidation = validateConfig(config);
  if (configValidation.error) {
    return Promise.reject(configValidation.error);
  }

  const manifestValidation = validateManifest(manifest);
  if (manifestValidation.error) {
    return Promise.reject(manifestValidation.error);
  }

  const agent = createAgent(config);
  const context = makeContext(agent);

  // eslint-disable-next-line functional/no-let
  let isReady;
  try {
    isReady = await context.request(
      {
        url: '/__healthcheck',
      },
      false
    );
  } catch (e) {
    console.log(e, 'error');
  }
  if (!isReady) {
    console.log('aidbox not ready', 'error');
    process.exit(0);
  }

  const { subscriptionHandlers, patchedManifest } = patchManifest(manifest);
  const server = createServer(
    dispatch(config, patchedManifest, context, subscriptionHandlers)
  );

  await ensureManifest(agent, config, patchedManifest);
  await startServer(server);
};

export enum EAccept {
  TEXT = 'text/plain',
  YAML = 'text/yaml',
  JSON = 'application/json',
}

export enum EOperation {
  OPERATION = 'operation',
  SUBSCRIPTION = 'subscription',
}

const resolveContentType = (msg: any) => {
  switch (msg.request?.headers?.accept) {
    case EAccept.YAML:
    case EAccept.TEXT:
      return msg.request.headers.accept;
    default:
      return EAccept.JSON;
  }
};

export type TDispatchFn = (
  config: TConfig,
  manifest: TPatchedManifest,
  context: TContext,
  subscriptionHandlers: TSubscriptionHandlers
) => RequestListener;

const checkAuthHeader = (
  appId: string,
  appSecret: string,
  authHeader?: string
) => {
  if (!authHeader) {
    return false;
  }
  const [auth] = authHeader.split(' ').slice(1, 2);
  return auth === Buffer.from(`${appId}:${appSecret}`).toString('base64');
};

const dispatch: TDispatchFn = (
  config,
  manifest,
  context,
  subscriptionHandlers
) => (req, res) => {
  manifest;
  const sendResponse = (
    text: string,
    status = 200,
    headers: Record<string, string> = {}
  ) => {
    // eslint-disable-next-line functional/immutable-data
    res.statusCode = status;
    Object.keys(headers).forEach((k: string) => {
      res.setHeader(k, headers[k]);
    });
    res.end(text);
  };

  // eslint-disable-next-line functional/no-let
  let reqBody = '';
  req.on('data', (chunk) => {
    reqBody += chunk.toString();
  });
  req.on('end', async () => {
    console.log(reqBody);
    try {
      const msg = JSON.parse(reqBody);
      res.setHeader('Content-Type', resolveContentType(msg));

      if (
        !checkAuthHeader(
          config.APP_ID,
          config.APP_SECRET,
          req.headers.authorization
        )
      ) {
        sendResponse(JSON.stringify({ message: 'Access Denied' }), 403);
        return;
      }

      const operation = msg.type;

      if (operation === EOperation.SUBSCRIPTION) {
        const handlerId = msg.handler;
        if (subscriptionHandlers[handlerId]) {
          subscriptionHandlers[handlerId]({}, msg);
          sendResponse(JSON.stringify({ status: 'start subs' }));
        }
        return;
      }
      if (
        operation === EOperation.OPERATION &&
        manifest.operations[msg.operation.id]
      ) {
        const { handler } = manifest.operations[msg.operation.id];
        const { status, headers, resource, body } = await handler(context, msg);
        if (msg.request.headers.accept === 'text/yaml') {
          sendResponse(yaml.dump(resource, { noRefs: true }), status, headers);
          return;
        } else if (body) {
          sendResponse(body, status, headers);
          return;
        } else {
          sendResponse(JSON.stringify(resource), status, headers);
          return;
        }
      }
    } catch (e) {
      console.log(e);
      sendResponse(JSON.stringify(e));
    }
  });
};

const ensureManifest = async (
  clientInstance: TAgent,
  config: TConfig,
  manifest: any
) => {
  const mergedManifest = {
    resourceType: 'App',
    apiVersion: 1,
    type: 'app',
    id: config.APP_ID,
    endpoint: {
      url: `${config.APP_URL}/aidbox`,
      type: 'http-rpc',
      secret: config.APP_SECRET,
    },
    ...manifest,
  };

  return await clientInstance.request({
    url: '/App',
    method: 'put',
    data: mergedManifest,
  });
};
