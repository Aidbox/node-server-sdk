import R from 'ramda';

import { ProcessEnv, TConfig } from '../types';

export const prepareConfig = (envs: ProcessEnv): TConfig => {
  const keys = [
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
  return R.pick(keys, envs) as TConfig;
};

export const validateConfig = (
  config: TConfig
): { readonly error?: string } => {
  type configKey = keyof typeof config;
  const missingParameters = Object.keys(config)
    .map((key) => {
      const value = config[key as configKey];
      if (value === '' || value === undefined) {
        return key;
      }
      return;
    })
    .filter((k) => k);

  if (Object.keys(missingParameters).length > 0) {
    return { error: `Missing variables ${missingParameters.toString()}` };
  }
  return {};
};
