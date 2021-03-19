import { RequestListener } from 'http';

import R from 'ramda';

import {
  ProcessEnv,
  ServerConfig,
  TPatchedManifest,
  TRawManifest,
  TSubscriptionHandlers,
} from '../types';

import { createAgent, createServer, startServer, TAgent } from './http';

export const prepareConfig = (envs: ProcessEnv): ServerConfig => {
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
  return R.pick(keys, envs) as ServerConfig;
};

const validateConfig = (config: ServerConfig): { readonly error?: string } => {
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
  /*
  Raw manifest
  manifest: {
    subscriptions: {
      Patient: {
        handler: () => any
      }
    }
  }

  Patched manifest
  manifest: {
    subscriptions: {
      Patient: {
        handler: 'Patient_handler'
      }
    }
  }

  subscriptionHandlers: {
    Patient_handler: () => any
  }
   */

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

export const startApp = async (
  config: ServerConfig,
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

  const agent = createAgent();

  const { subscriptionHandlers, patchedManifest } = patchManifest(manifest);
  const server = createServer(
    dispatch(config, patchedManifest, subscriptionHandlers)
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
  config: ServerConfig,
  manifest: TPatchedManifest,
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

const dispatch: TDispatchFn = (config, manifest, subscriptionHandlers) => (
  req,
  res
) => {
  manifest;
  const sendResponse = (text: string | any, status = 200) => {
    if (status) {
      // eslint-disable-next-line functional/immutable-data
      res.statusCode = status;
    }
    res.end(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
  };

  // eslint-disable-next-line functional/no-let
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    console.log(body);
    try {
      const msg = JSON.parse(body);
      res.setHeader('Content-Type', resolveContentType(msg));

      if (
        !checkAuthHeader(
          config.APP_ID,
          config.APP_SECRET,
          req.headers.authorization
        )
      ) {
        sendResponse({ message: 'Access Denied' }, 403);
        return;
      }

      const operation = msg.type;

      if (operation === EOperation.SUBSCRIPTION) {
        const handlerId = msg.handler;
        if (subscriptionHandlers[handlerId]) {
          subscriptionHandlers[handlerId]({}, msg);
          sendResponse({ status: 'start subs' });
        }
        return;
      }
      //   if (operation === 'operation') {
      //     const operationId = msg.operation.id;
      //     if (operationId in this.#manifest.operations) {
      //       const op = this.#manifest.operations[operationId];
      //       if (op.handler) {
      //         const { handler } = op;
      //         return handler(this.#ctx, msg)
      //           .then((r) => {
      //             resp.statusCode = r.status ?? 200;
      //             if (r?.headers) {
      //               Object.keys(r.headers).forEach((k) => {
      //                 resp.setHeader(k, r.headers[k]);
      //               });
      //             }
      //             if (msg.request.headers.accept === 'text/yaml') {
      //               resp.end(yaml.dump(r.resource, { noRefs: true }));
      //             } else if (r.body) {
      //               resp.end(r.body);
      //             } else {
      //               resp.end(JSON.stringify(r.resource));
      //             }
      //           })
      //           .catch((error) => {
      //             console.log(error);
      //             if (error.response) {
      //               console.log(
      //                 `status: ${error.response.status}`,
      //                 error.response.data
      //               );
      //             }
      //             if (error.body?.id === 'not-found') {
      //               resp.statusCode = 404;
      //               resp.end(
      //                 JSON.stringify({
      //                   error: {
      //                     message: error.message
      //                       ? error.message
      //                       : error.body.text.div,
      //                   },
      //                 })
      //               );
      //             }
      //             resp.statusCode = 500;
      //             resp.end(
      //               JSON.stringify({
      //                 error: {
      //                   message: error.message
      //                     ? error.message
      //                     : error.body.text.div,
      //                 },
      //               })
      //             );
      //           });
      //       }
      //       res.statusCode = 500;
      //       res.end(
      //         JSON.stringify({
      //           error: {
      //             message: `Operation [${operationId}] handler not found`,
      //           },
      //         })
      //       );
      //     }
      //     res.statusCode = 404;
      //     res.end(
      //       JSON.stringify({
      //         error: {
      //           message: `Operation [${operationId}] not found`,
      //         },
      //       })
      //     );
      //   }
      //   res.statusCode = 422;
      //   res.end(
      //     JSON.stringify({
      //       error: {
      //         message: `Unknown message type [${operation}]`,
      //       },
      //     })
      //   );
    } catch (e) {
      console.log(e);
      sendResponse({ message: 'Welcome to Aidbox' });
    }
  });
};

const ensureManifest = (agent: TAgent, config: ServerConfig, manifest: any) => {
  const mergedManifest = {
    resourceType: 'App',
    apiVersion: 1,
    type: 'app',
    id: config.APP_ID,
    endpoint: {
      url: `${config.APP_URL}aidbox`,
      type: 'http-rpc',
      secret: config.APP_SECRET,
    },
    ...manifest,
  };

  agent
    .put(`${config.AIDBOX_URL}App`)
    .auth(config.AIDBOX_CLIENT_ID, config.AIDBOX_CLIENT_SECRET)
    .send(mergedManifest)
    .then((res: any) => {
      console.log('Updated manifest', res.body);
    });
};
