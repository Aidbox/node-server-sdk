/* eslint-disable  @typescript-eslint/no-var-requires */

/**
 * Helpers for work with manifest object

 * @module Manifest
 */

import fs from 'fs';
import path from 'path';
import R from 'ramda';
import yaml from 'yaml';
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

export const mergeManifests = <T>(...objects: readonly TRawManifest<T>[]) => {
    return objects.reduce((prev, next) => {
        return R.mergeDeepLeft(prev, next) as TRawManifest<T>;
    }, {} as TRawManifest<T>);
};

export const readModulesManifests = (modulesRoot: string) => {
    const moduleNames = fs.readdirSync(modulesRoot);
    return moduleNames.map((moduleName) => {
        const modulePath = path.resolve(modulesRoot, moduleName);
        const moduleEntities = readModuleEntities(modulePath);
        let moduleManifest;
        try {
            const module = require(modulePath);
            moduleManifest = module.manifest;
            return { ...moduleManifest, entities: moduleEntities };
        } catch (e) {
            console.log(
                '\x1b[31m%s\x1b[0m',
                `Detect missing module index file definition by path - ${e.message}.\nOnly .yaml resources file will be applied`
            );
            return { entities: moduleEntities };
        }
    });
};

const readModuleEntities = (modulePath: string) => {
    const entitiesPath = path.resolve(modulePath, 'entities');
    if (!fs.existsSync(entitiesPath)) {
        return [];
    }
    const files = fs.readdirSync(entitiesPath);
    const entities: Record<string, any> = {};
    files.forEach((fileName) => {
        const filePath = path.resolve(entitiesPath, fileName);
        const text = fs.readFileSync(filePath, 'utf-8');
        const json = yaml.parse(text);
        const key = fileName.replace('.yml', '');
        entities[key] = json;
    });
    return entities;
};
