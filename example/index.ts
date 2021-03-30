import { mergeModuleManifest } from './../src/lib/manifest';
import path from 'path';
import { createApp, startApp, createConfig  } from '../src';
import { TRawManifest } from '../src/types';

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
  entities: {
    Foo:{
      attrs:{
        tt:{
          type:"string"
        }
      }
    }
  },
  operations: {
    test: {
      method: 'GET',
      path: ['$test-operation'],
      handler: async (context) => {
        context.greet('Alice');
        context.log({message: {test: true}, v: '2020.02', fx: "testOperation", type: "backend-test"})
        return { resource: {test:true} };
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
  const config = createConfig(path.resolve('../.env'));

  const mergedManifest = mergeModuleManifest(manifest,{entities:{Test:{attrs:{test:{type: "string"}}}}},
    {entities:{Baz:{attrs:{test:{type: "string"}}}}})

  console.log("manifest",mergedManifest);

  const app = createApp(config, manifest, contextHelpers);
  if (!app) {
    console.error(`Unable to create app. Check config/manifest errors.`);
    process.exit(1);
  }
  await startApp(app);
};

if (require.main === module) {
  main();
}
