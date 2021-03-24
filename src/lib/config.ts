/**
 * Helpers for work with config object
 *
 * @module Config
 */

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

export const createConfig = (envs = process.env as TConfig): TConfig => {
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

  return errors.length
    ? new Error(`Invalid config.\n${errors.join('\n')}`)
    : undefined;
};
