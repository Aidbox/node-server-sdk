/**
 * Main function for create and start application
 *
 * @module App
 */

import { TConfig, TPatchedManifest, TRawManifest } from '../types';

import { awaitAidbox, createAgent, TAgent } from './agent';
import { validateConfig } from './config';
import { createContext } from './context';
import { createDispatch } from './dispatch';
import { createServer, startServer, TServer } from './http';
import { patchManifest, syncManifest, validateManifest } from './manifest';

export type TApp<CH> = {
  readonly httpServer: TServer;
  readonly agent: TAgent;
  readonly config: TConfig;
  readonly patchedManifest: TPatchedManifest<CH>;
};

export const createApp = <CH = Record<string, never>>(
  config: TConfig | undefined,
  manifest: TRawManifest<CH>,
  contextHelpers?: CH
): TApp<CH> | undefined => {
  if (!config) {
    return;
  }
  const configError = validateConfig(config);
  const manifestError = validateManifest(manifest);

  if (configError || manifestError) {
    configError && console.error('config', configError);
    manifestError && console.error('manifest', manifestError);
    return;
  }

  const agent = createAgent({
    baseURL: config.AIDBOX_URL,
    auth: {
      username: config.AIDBOX_CLIENT_ID,
      password: config.AIDBOX_CLIENT_SECRET,
    },
  });
  const { subscriptionHandlers, patchedManifest } = patchManifest(manifest);
  const context = createContext(agent, contextHelpers);
  const dispatch = createDispatch(config, patchedManifest, context, subscriptionHandlers);
  const httpServer = createServer(dispatch);

  return {
    httpServer,
    agent,
    config,
    patchedManifest,
  };
};

export const startApp = async <CH>(app: TApp<CH>) => {
  const { agent, config, patchedManifest, httpServer } = app;
  try {
    await awaitAidbox(agent);
  } catch (err) {
    console.error(`Aidbox server is unreachable.`);
    process.exit(1);
    return;
  }
  await syncManifest(agent, config, patchedManifest);
  await startServer(httpServer);
};
