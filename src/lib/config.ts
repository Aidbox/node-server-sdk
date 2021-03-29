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

const readConfigFile = (path: string) => {
  try {
    const file = fs.readFileSync(path);
    const config = JSON.parse(file.toString()) as TConfig;
    return config;
  } catch (e) {
    console.error('Error while read config file: ', e.message);
    return undefined;
  }
};

export const createConfig = (envs = process.env as TConfig | string): TConfig | undefined => {
  if (typeof envs === 'string') {
    if (envs.includes('.env')) {
      dotenv.config({ path: envs });
      return R.pick(configKeys, process.env as TConfig);
    }
    if (envs.endsWith('.json')) {
      const config = readConfigFile(envs);
      if (!config) {
        return undefined;
      }
      return R.pick(configKeys, config);
    }
    return undefined;
  }
  return R.pick(configKeys, envs);
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
