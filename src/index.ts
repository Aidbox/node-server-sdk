import dotenv from 'dotenv';

/**
 * By default we export createApp and startApp functions
 *
 * @module Index
 */

dotenv.config();

export * from './lib/app';
export * from './lib/config';
export { awaitAidbox } from './lib/agent';
export * from './types';
export { mergeModuleManifest } from './lib/manifest';
