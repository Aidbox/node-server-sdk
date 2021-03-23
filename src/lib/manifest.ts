import {
  TConfig,
  TPatchedManifest,
  TRawManifest,
  TSubscriptionHandlers,
} from '../types';

import { TAgent } from './agent';

export const validateManifest = (
  manifest: TRawManifest
): { readonly error?: string } => {
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

export const patchManifest = (
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

export const syncManifest = async (
  agent: TAgent,
  config: TConfig,
  manifest: TPatchedManifest
) => {
  return await agent.request({
    url: '/App',
    method: 'put',
    data: {
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
    },
  });
};
