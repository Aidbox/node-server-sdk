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
  'PGUSER',
  'PGHOST',
  'PGDATABASE',
  'PGPASSWORD',
];

export const createConfigFromJson = (path: string): TConfig => {
  try {
    const file = fs.readFileSync(path);
    const config = JSON.parse(file.toString()) as TConfig;
    return R.pick(configKeys, config);
  } catch (e) {
    console.error('Error while read config file: ', e.message);
    return {} as TConfig;
  }
};

export const createConfigFromEnv = (path?: string): TConfig => {
  if (path) {
    dotenv.config({ path: path });
  }
  return R.pick(configKeys, process.env as TConfig);
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
