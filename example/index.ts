import { createApp, startApp } from '../src';
import { TRawManifest } from '../src/types';
import { createConfig } from '../src/lib/config';

type TContextHelpers = {
  greet(name: string): void;
};

const contextHelpers: TContextHelpers = {
  greet: (name) => {
    console.log(`Hello, ${name}`);
  },
};

const manifest: TRawManifest<TContextHelpers> = {
  resources: {
    AccessPolicy: {},
  },
  entities: {},
  operations: {
    test: {
      method: 'GET',
      path: ['$test-operation'],
      handler: async (context) => {
        context.greet('Alice');
        const response = await context.psql<{ result: string[] }>(
          'SELECT NOW()'
        );
        return { resource: response[0] };
      },
    },
  },
  subscriptions: {
    // Patient_handler
    Patient: {
      handler: () => {
        console.log('qwerty');
        return true;
      },
    },
  },
};

const main = async () => {
  const config = createConfig();

  // Example: Application without context helpers
  // const { app: appWithoutHelpers, errors } = createApp(config, manifest);
  // await startApp(appWithoutHelpers);

  // Example: Application with context helpers
  const app = createApp<TContextHelpers>(config, manifest, contextHelpers);
  if (!app) {
    console.error(`Unable to create app. Check config/manifest errors.`);
    process.exit(1);
    return;
  }
  await startApp(app);
};

if (require.main === module) {
  main();
}
