import { createApp, startApp } from '../src';
import { TRawManifest } from '../src/types';
import { prepareConfig } from '../src/lib/config';

const config = prepareConfig(process.env);

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
  // Example: Application without context helpers
  // const appWithoutHelpers = createApp(config, manifest);
  // await startApp(appWithoutHelpers);

  // Example: Application with context helpers
  const app = createApp<TContextHelpers>(config, manifest, contextHelpers);
  await startApp(app);
  console.log('App started');
};

if (require.main === module) {
  main();
}
