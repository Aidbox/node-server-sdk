import { startApp } from '../src/lib/app';
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
      handler: async () => {
        return {
          resource: {
            test: 'work',
          },
        };
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

startApp(config, manifest)
  .then(() => console.log('ready'))
  .catch((e) => console.log('error: ', e));
