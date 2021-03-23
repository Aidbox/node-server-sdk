import { createApp, startApp } from '../src/lib/app';
import { TRawManifest } from '../src/types';
import { prepareConfig } from '../src/lib/config';

const config = prepareConfig(process.env);

const manifest: TRawManifest = {
  resources: {
    AccessPolicy: {},
  },
  entities: {},
  operations: {
    test: {
      method: 'GET',
      path: ['$test-operation'],
      handler: async (context) => {
        const response = await context.psql<{ result: string[] }>(
          'SELECT NOW()'
        );
        return { resource: response[0] };
        // return {
        //   resource: {
        //     test: 'work',
        //   },
        // };
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
  const app = createApp(config, manifest);
  await startApp(app);
  console.log('App started');
  // startApp(config, manifest)
  //   .then(() => console.log('ready'))
  //   .catch((e) => console.log('error: ', e));
};

if (require.main === module) {
  main();
}
