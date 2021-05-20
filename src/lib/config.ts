/**
 * Helpers for work with config object
 *
 * @module Config
 */

import fs from 'fs';
import dotenv from 'dotenv';
import R from 'ramda';
import { TConfig, TConfigKeys } from '../types';

const configKeys: TConfigKeys = [
    'APP_DEBUG',
    'AIDBOX_URL',
    'AIDBOX_CLIENT_ID',
    'AIDBOX_CLIENT_SECRET',
    'APP_ID',
    'APP_URL',
    'APP_PORT',
    'APP_SECRET',
];

const pgKeys: TConfigKeys = ['PGUSER', 'PGHOST', 'PGDATABASE', 'PGPASSWORD', 'PGPORT'];

export const createConfigFromJson = (path: string): [TConfig, TConfig] => {
    try {
        const file = fs.readFileSync(path);
        const config = JSON.parse(file.toString()) as TConfig;
        return [config, R.pick(configKeys, config)];
    } catch (e) {
        console.error('Error while read config file: ', e.message);
        return [{} as TConfig, {} as TConfig];
    }
};

export const createConfigFromEnv = (path?: string): [TConfig, TConfig] => {
    if (path) {
        dotenv.config({ path: path });
    }
    return [process.env as TConfig, R.pick(configKeys, process.env as TConfig)];
};

export const validateConfig = (config: TConfig): Error | undefined => {
    const errors = configKeys.reduce<readonly string[]>((acc, key) => {
        if (typeof config[key] === 'undefined') {
            return acc.concat(`Missing key: ${key}`);
        }
        if (!config[key]) {
            return acc.concat(`Missing value for key "${key}"`);
        }
        return acc;
    }, []);

    return errors.length ? new Error(`Invalid config.\n${errors.join('\n')}`) : undefined;
};

export const getDbConfig = (config: TConfig): Error | TConfig => {
    const errors = pgKeys.reduce<readonly string[]>((acc, key) => {
        if (typeof config[key] === 'undefined') {
            return acc.concat(`Missing key: ${key}`);
        }
        if (!config[key]) {
            return acc.concat(`Missing value for key "${key}"`);
        }
        return acc;
    }, []);

    return errors.length ? new Error(`Invalid config.\n${errors.join('\n')}`) : R.pick(pgKeys, config);
};

export const getAppConfig = (config: TConfig): Partial<TConfig> => {
    return pick(config, ['APP_DEBUG', 'AIDBOX_URL']);
};

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const ret: any = {};
    for (const key of keys) {
        ret[key] = obj[key];
    }
    return ret;
}
