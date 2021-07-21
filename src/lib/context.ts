/**
 * Helpers for work with context object which will be passed in all operation handlers
 *
 * @module Context
 */

import { inspect } from 'util';
import { AxiosRequestConfig } from 'axios';
import { Pool } from 'pg';
import { TConfig, TContext, TLogData } from '../types';
import { TAgent } from './agent';
import { getAppConfig, getDbConfig } from './config';

export const createContext = async <T>(agent: TAgent, config: TConfig, contextHelpers: T): Promise<TContext<T>> => {
    const context: Record<string, any> = {};

    context.request = (config: AxiosRequestConfig, jsonOverride = true) => {
        return agent.request({
            ...config,
            responseType: jsonOverride ? 'json' : 'text',
        });
    };
    context.log = (data: TLogData) => {
        if (config.APP_DEBUG === 'true') {
            console.log(inspect(data, false, null, true));
        }
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
    const dbConfig = getDbConfig(config);
    if (dbConfig instanceof Error) {
        if (config.APP_DEBUG === 'true') {
            console.log('Will be using aidbox sql endpoint. You miss params for use pg client.', dbConfig.message);
        }
        context.query = async (query: string, params?: any[]) => {
            try {
                const response = await context.request({
                    url: '/$sql',
                    method: 'post',
                    data: [query, ...(params || [])],
                });
                return { query, params, rows: response.data, rowsCount: response.data?.length || 0 };
            } catch (e) {
                return { query, params, rows: [], error: e.response.data?.text?.div || 'Unknown error', rowsCount: 0 };
            }
        };
    } else {
        if (config.APP_DEBUG === 'true') {
            console.log('Will be using pg client.');
        }
        try {
            const pool = new Pool({
                host: dbConfig.PGHOST,
                user: dbConfig.PGUSER,
                password: dbConfig.PGPASSWORD,
                port: Number(dbConfig.PGPORT),
                database: dbConfig.PGDATABASE,
            });

            context.query = async (query: string, params?: any[]) => {
                context.log({
                    message: { query, params },
                    type: 'sql',
                    fx: 'sql-query',
                });
                try {
                    const client = await pool.connect();
                    const response = await client.query(query, params);
                    client.release();
                    return { query, params, rows: response.rows, rowsCount: response.rowCount };
                } catch (e) {
                    return { query, params, rows: [], error: e.message || 'Unknown error', rowsCount: 0 };
                }
            };
        } catch (e) {
            console.log('err', e);
            process.exit(1);
        }
    }

    context.psql = async <T>(query: string): Promise<readonly T[]> => {
        const response = await context.request({
            url: '/$psql',
            method: 'post',
            data: { query },
        });
        return response.data[0].result;
    };

    context.getAppConfig = () => {
        return getAppConfig(config);
    };

    return { ...context, ...contextHelpers } as TContext<T>;
};
