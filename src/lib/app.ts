import yaml from 'js-yaml';

import {
  EAccept,
  EOperation,
  TConfig,
  TContext,
  TDispatchFn,
  TMessage,
  TPatchedManifest,
  TRawManifest,
} from '../types';

import { validateConfig } from './config';
import { makeContext } from './context';
import {
  createAgent,
  createServer,
  startServer,
  TAgent,
  TServer,
} from './http';
import { ensureManifest, patchManifest, validateManifest } from './manifest';

export type TApp = {
  readonly httpServer: TServer;
  readonly context: TContext;
  readonly agent: TAgent;
  readonly config: TConfig;
  readonly patchedManifest: TPatchedManifest;
};

export const createApp = (config: TConfig, manifest: TRawManifest): TApp => {
  const configValidation = validateConfig(config);
  if (configValidation.error) {
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error(configValidation.error);
  }

  const manifestValidation = validateManifest(manifest);
  if (manifestValidation.error) {
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error(manifestValidation.error);
  }

  const agent = createAgent(config);
  const context = makeContext(agent);
  const { subscriptionHandlers, patchedManifest } = patchManifest(manifest);
  const httpServer = createServer(
    dispatch(config, patchedManifest, context, subscriptionHandlers)
  );

  return {
    httpServer,
    context,
    agent,
    config,
    patchedManifest,
  };
};

export const startApp = async (app: TApp) => {
  // eslint-disable-next-line functional/no-let
  let isReady;
  try {
    isReady = await app.context.request(
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

  await ensureManifest(app.agent, app.config, app.patchedManifest);
  await startServer(app.httpServer);
};

const resolveContentType = (msg: TMessage) => {
  switch (msg.request?.headers?.accept) {
    case EAccept.YAML:
    case EAccept.TEXT:
      return msg.request.headers.accept;
    default:
      return EAccept.JSON;
  }
};

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
      const msg = JSON.parse(reqBody) as TMessage;
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
        const handlerId = msg.handler as string;
        if (subscriptionHandlers[handlerId]) {
          subscriptionHandlers[handlerId](context, msg);
          sendResponse(JSON.stringify({ status: 'start subs' }));
        }
        return;
      }

      const operationId = msg.operation?.id;
      if (
        operation === EOperation.OPERATION &&
        operationId &&
        manifest.operations[operationId]
      ) {
        const { handler } = manifest.operations[operationId];
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
