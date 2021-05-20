/**
 * Main function for create and start application
 *
 * @module App
 */

import { TConfig, TContext, TPatchedManifest, TRawManifest } from '../types';
import { awaitAidbox, createAgent, TAgent } from './agent';
import { validateConfig } from './config';
import { createContext } from './context';
import { createDispatch } from './dispatch';
import { createServer, startServer, TServer } from './http';
import { patchManifest, syncManifest, validateManifest } from './manifest';

export type TApp<T> = {
    readonly httpServer: TServer;
    readonly context: TContext<T>;
    readonly agent: TAgent;
    readonly config: TConfig;
    readonly patchedManifest: TPatchedManifest<T>;
};

export const createApp = async <T>(
    initConfig: TConfig,
    config: TConfig,
    manifest: TRawManifest<T>,
    contextHelpers?: T
): Promise<TApp<T> | undefined> => {
    const configError = validateConfig(config);
    const manifestError = validateManifest(manifest);

    if (configError || manifestError) {
        configError && console.error('config', configError);
        manifestError && console.error('manifest', manifestError);
        return;
    }

    const agent = createAgent({
        baseURL: config.AIDBOX_URL,
        auth: {
            username: config.AIDBOX_CLIENT_ID,
            password: config.AIDBOX_CLIENT_SECRET,
        },
    });
    const { subscriptionHandlers, patchedManifest } = patchManifest(manifest);
    const context = await createContext(agent, initConfig, contextHelpers);
    const dispatch = createDispatch(config, patchedManifest, context, subscriptionHandlers);
    const httpServer = createServer(dispatch);

    return {
        httpServer,
        agent,
        context,
        config,
        patchedManifest,
    };
};

export const startApp = async <T>(app: TApp<T>, port?: number) => {
    const { agent, config, patchedManifest, httpServer } = app;
    try {
        await awaitAidbox(agent);
        await syncManifest(agent, config, patchedManifest);
    } catch (err) {
        if (err.config.url === '/__healthcheck') console.error(`Aidbox server is unreachable.`);
        else console.error(err.response.data);
        process.exit(1);
    }
    await startServer(httpServer, port || +config.APP_PORT);
};
