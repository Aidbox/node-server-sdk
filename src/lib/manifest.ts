/**
 * Helpers for work with manifest object

 * @module Manifest
 */

import R from 'ramda';

import { TConfig, TPatchedManifest, TRawManifest, TSubscriptionHandlers } from '../types';

import { TAgent } from './agent';

export const validateManifest = <T>(manifest: TRawManifest<T>): Error | undefined => {
  const { subscriptions = {}, operations = {} } = manifest;

  const subscriptionKeys = Object.keys(subscriptions);
  const subscriptionErrors = subscriptionKeys.reduce<readonly string[]>((acc, key) => {
    const handlerType = typeof subscriptions[key].handler;
    if (handlerType !== 'function') {
      const error = `"${key}" subscription handler should be a function (got ${handlerType})`;
      return acc.concat(error);
    }
    return acc;
  }, []);

  const operationKeys = Object.keys(operations);
  const operationErrors = operationKeys.reduce<readonly string[]>((acc, key) => {
    const handlerType = typeof operations[key].handler;
    if (handlerType !== 'function') {
      const error = `"${key}" subscription handler should be a function (got ${handlerType})`;
      return acc.concat(error);
    }
    return acc;
  }, []);

  const errors = [...subscriptionErrors, ...operationErrors];

  return errors.length ? new Error(`Invalid manifest\n${errors.join('\n')}`) : undefined;
};

export const patchManifest = <T>(
  manifest: TRawManifest<T>
): {
  readonly subscriptionHandlers: TSubscriptionHandlers<T>;
  readonly patchedManifest: TPatchedManifest<T>;
} => {
  const subscriptionHandlers = Object.keys(manifest.subscriptions || {}).reduce((handlers, key) => {
    return {
      ...handlers,
      [`${key}_handler`]: manifest.subscriptions?.[key].handler,
    };
  }, {});

  const manifestSubscriptions = Object.keys(manifest.subscriptions || {}).reduce((subscriptions, key) => {
    return {
      ...subscriptions,
      [key]: { handler: `${key}_handler` },
    };
  }, {});

  const patchedManifest = { ...manifest, subscriptions: manifestSubscriptions };

  return {
    subscriptionHandlers,
    patchedManifest,
  };
};

export const syncManifest = async <T>(agent: TAgent, config: TConfig, manifest: TPatchedManifest<T>) => {
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

// eslint-disable-next-line functional/functional-parameters
export const mergeModuleManifest = (...objects: readonly TRawManifest[]) => {
  return objects.reduce((prev, next) => {
    return R.mergeDeepLeft(prev, next) as TRawManifest;
  }, {} as TRawManifest);
};
