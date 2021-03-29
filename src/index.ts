/**
 * By default we export createApp and startApp functions
 *
 * @module Index
 */

import dotenv from 'dotenv';
dotenv.config();

export * from './lib/app';
export * from './lib/config';
export { awaitAidbox } from './lib/agent';
export * from './types';
