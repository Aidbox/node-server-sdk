import { inspect } from 'util';
import { mergeManifests, readModulesManifests } from './../src/lib/manifest';
import path from 'path';
import { createApp, startApp, createConfigFromEnv } from '../src';
import { TRawManifest } from '../src/types';

export type TContextHelper = {
    greet: () => any;
};

const manifest: TRawManifest<TContextHelper> = {
    resources: {
        AccessPolicy: {},
    },
    operations: {
        test: {
            method: 'GET',
            path: ['$test-operation'],
            handler: async (context) => {
                context.log({ message: { test: true }, v: '2020.02', fx: 'testOperation', type: 'backend-test' });
                return { resource: { test: true } };
            },
        },
        test2: {
            method: 'GET',
            path: ['$t'],
            handler: async (context) => {
                await context.request({
                    url: '/',
                    method: 'post',
                    data: {
                        type: 'transaction',
                        entry: [
                            {
                                request: {
                                    method: 'POST',
                                    url: '/sf',
                                },
                                resource: {},
                            },
                        ],
                    },
                });
                return { resource: { test: true } };
            },
        },
    },
    subscriptions: {
        Patient: {
            handler: () => {
                console.log('qwerty');
                return true;
            },
        },
    },
};

const tt: TRawManifest<TContextHelper> = {
    operations: {
        test: {
            path: ['$tt'],
            method: 'GET',
            handler: async () => {
                return { resource: { test: true } };
            },
        },
    },
};


const main = async () => {
    const [initConfig, config] = createConfigFromEnv(path.resolve('../.env'));

    const modulesDir = path.resolve(__dirname, 'modules');
    const modulesManifests = readModulesManifests(modulesDir);
    console.log(inspect(modulesManifests,false,null,true));
    const mergedManifest = mergeManifests<TContextHelper>(
        manifest,
        { entities: { Test: { attrs: { test: { type: 'string' } } } } },
        { entities: { Baz: { attrs: { test: { type: 'string' } } } } },
        tt,
        ...modulesManifests
    );
    const app = await createApp(initConfig, config, mergedManifest);
    if (!app) {
        console.error(`Unable to create app. Check config/manifest errors.`);
        process.exit(1);
    }
    console.log(app.context.getAppConfig())
    const test = await app.context.query(`select * from "user" where id = $1`, ['admin']);
    console.log(test);
    await startApp(app);
};

if (require.main === module) {
    main();
}
