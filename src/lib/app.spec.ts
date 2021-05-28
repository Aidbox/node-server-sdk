import assert from 'assert';
import test from 'ava';
import sinon from 'sinon';
import { TConfig, TContext, TPatchedManifest, TRawManifest } from '../types';
import * as Agent from './agent';
import { TAgent } from './agent';
import { createApp, startApp } from './app';
import * as Context from './context';
import * as Dispatch from './dispatch';
import * as Server from './http';
import * as Manifest from './manifest';

test.afterEach.always(() => {
    sinon.restore();
});

test('createApp() fails on invalid config', async (t) => {
    const config = {} as TConfig;
    const manifest = {} as TRawManifest<any>;

    const errorStub = sinon.stub(console, 'error');
    const createAgentStub = sinon.stub(Agent, 'createAgent');
    const patchManifestStub = sinon.stub(Manifest, 'patchManifest');
    const createContextStub = sinon.stub(Context, 'createContext');
    const createDispatchStub = sinon.stub(Dispatch, 'createDispatch');
    const createServerStub = sinon.stub(Server, 'createServer');

    const app = await createApp(config, config, manifest);

    t.is(app, undefined);
    sinon.assert.calledOnce(errorStub);
    sinon.assert.calledWith(errorStub, 'config');
    sinon.assert.notCalled(createAgentStub);
    sinon.assert.notCalled(patchManifestStub);
    sinon.assert.notCalled(createContextStub);
    sinon.assert.notCalled(createDispatchStub);
    sinon.assert.notCalled(createServerStub);
});

test.skip('createApp() fails on invalid manifest', () => {
    // const app = createApp(config, manifest);
    // sinon.assert.calledOnce(errorStub);
    // sinon.assert.calledWith(errorStub, 'manifest');
    // t.is(app, undefined);
});

test('createApp() succeeds on valid config/manifest', async (t) => {
    const config = validConfig;
    const manifest = { subscriptions: {} } as TRawManifest<any>;
    const subscriptionHandlers = {};
    const patchedManifest = {} as TPatchedManifest<any>;
    const agent = {} as TAgent;
    const context = {} as TContext<any>;
    const dispatch = () => null;

    const errorStub = sinon.stub(console, 'error');
    const createAgentStub = sinon.stub(Agent, 'createAgent').returns(agent);
    const patchManifestStub = sinon.stub(Manifest, 'patchManifest').returns({ subscriptionHandlers, patchedManifest });
    const createContextStub = sinon.stub(Context, 'createContext').returns(context);
    const createDispatchStub = sinon.stub(Dispatch, 'createDispatch').returns(dispatch);
    const createServerStub = sinon.stub(Server, 'createServer');

    const app = await createApp(config, config, manifest);

    t.not(app, undefined);
    sinon.assert.notCalled(errorStub);
    sinon.assert.calledWith(createAgentStub, {
        baseURL: config.AIDBOX_URL,
        auth: {
            username: config.AIDBOX_CLIENT_ID,
            password: config.AIDBOX_CLIENT_SECRET,
        },
    });
    sinon.assert.calledWith(patchManifestStub, manifest);
    sinon.assert.calledWith(createContextStub, agent, config, undefined);
    sinon.assert.calledWith(createDispatchStub, config, patchedManifest, context, subscriptionHandlers);
    sinon.assert.calledWith(createServerStub, dispatch);
});

test('startApp() starts an app', async (t) => {
    const config = validConfig;
    const manifest = validManifest;
    const app = await createApp(config, config, manifest);
    assert.ok(app);

    const agentRequestStub = sinon.stub(app.agent, 'request');
    const serverListenStub = sinon.stub(app.httpServer, 'listen').callsArg(2);

    await startApp(app);

    sinon.assert.calledWith(
        agentRequestStub.firstCall,
        sinon.match({
            url: '/__healthcheck',
            responseType: 'text',
        })
    );

    sinon.assert.calledWith(
        agentRequestStub.secondCall,
        sinon.match({
            url: '/App',
            data: {
                id: config.APP_ID,
            },
        })
    );

    sinon.assert.calledWith(serverListenStub, 8090, '0.0.0.0' as any);

    t.pass();
});
//

const validConfig = {
    APP_DEBUG: 'APP_DEBUG',
    AIDBOX_URL: 'AIDBOX_URL',
    AIDBOX_CLIENT_ID: 'AIDBOX_CLIENT_ID',
    AIDBOX_CLIENT_SECRET: 'AIDBOX_CLIENT_SECRET',
    APP_ID: 'APP_ID',
    APP_URL: 'APP_URL',
    APP_PORT: '8090',
    APP_SECRET: 'APP_SECRET',
    PGUSER: 'PGUSER',
    PGHOST: 'PGHOST',
    PGDATABASE: 'PGDATABASE',
    PGPASSWORD: 'PGPASSWORD',
} as TConfig;

const validManifest = {
    operations: {},
    subscriptions: {},
};
