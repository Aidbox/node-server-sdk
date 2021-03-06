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
import { merge } from './deep-merge';

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
        const [resources, entities] = readModuleResourcesRoot(modulePath);
        const module = require(modulePath);
        const moduleManifest = module.manifest;
        return merge({}, moduleManifest, { entities: entities }, { resources: resources });
    });
};

const readModuleResourcesRoot = (modulePath: string) => {
    const resourcesPath = path.resolve(modulePath, 'resources');
    const entities = readModuleResources(resourcesPath, 'entities');
    const resources = readModuleResources(resourcesPath, 'resources');
    return [resources, entities];
};

const readModuleResources = (modulePath: string, innerPath: string) => {
    const resourcesPath = path.resolve(modulePath, innerPath);
    if (!fs.existsSync(resourcesPath)) {
        return {};
    }
    const files = fs.readdirSync(resourcesPath);
    const resources: Record<string, any> = {};
    files.forEach((fileName) => {
        if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) {
            const filePath = path.resolve(resourcesPath, fileName);
            const text = fs.readFileSync(filePath, 'utf-8');
            const json = yaml.parse(text);
            const key = fileName.replace(/\.[^/.]+$/, '');
            resources[key] = json;
        } else {
            console.log(
                '\x1b[31m%s\x1b[0m',
                `Invalid file extension for resource file  - ${fileName} in path ${resourcesPath} `
            );
        }
    });
    return resources;
};
