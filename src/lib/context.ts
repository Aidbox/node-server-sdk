/**
 * Helpers for work with context object which will be passed in all operation handlers
 *
 * @module Context
 */

import { inspect } from 'util';
import { AxiosRequestConfig } from 'axios';
import { TConfig, TContext, TLogData } from '../types';
import { TAgent } from './agent';
// import { Pool } from 'pg';

const pgKeys: string[] = ['PGUSER', 'PGHOST', 'PGDATABASE', 'PGPASSWORD', 'PGPORT'];

export const createContext = <T>(agent: TAgent, config: TConfig, contextHelpers: T): TContext<T> => {
    const context: Record<string, any> = {};

    context.request = (config: AxiosRequestConfig, jsonOverride = true) => {
        return agent.request({
            ...config,
            responseType: jsonOverride ? 'json' : 'text',
        });
    };
    context.log = (data: TLogData) => {
        console.log(inspect(data, false, null, true));
        try {
            return agent.request({
                url: '/$loggy',
                method: 'post',
                data,
            });
        } catch (err) {
            console.error('Logging error', err);
            return Promise.resolve();
        }
    };
    const dbConfig = validateDbConfig();
    if (dbConfig) {
        context.query = async (query: string, params?: any[]) => {
            console.log(params);
            const response = await context.request({
                url: '/$psql',
                method: 'post',
                data: { query },
            });
            console.log(response.data);
            return { ready: query };
        };
    } else if (config.APP_DEBUG === 'true') {
        console.log('Will be using aidbox sql endpoint. You miss params for use pg client', dbConfig);
        context.query = async (query: string, params?: any[]) => {
            const response = await context.request({
                url: '/$sql',
                method: 'post',
                data: [query, ...(params || [])],
            });
            console.log(response.data);
            return { test: query };
        };
    }

    context.psql = async <T>(query: string): Promise<readonly T[]> => {
        const response = await context.request({
            url: '/$psql',
            method: 'post',
            data: { query },
        });
        return response.data[0].result;
    };

    return { ...context, ...contextHelpers } as TContext<T>;
};

const validateDbConfig = (): Error | undefined => {
    const config = process.env;
    const errors = pgKeys.reduce<readonly string[]>((acc, key) => {
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
