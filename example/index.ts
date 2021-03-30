import { mergeModuleManifest } from './../src/lib/manifest';
import path from 'path';
import { createApp, startApp, createConfig  } from '../src';
import { TRawManifest } from '../src/types';

export type TContextHelper = {
  greet:() =>any
}

const manifest: TRawManifest = {
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

const tt = {
  operations:{
    test:{
      path: ['$tt'],
      method:"GET",
      handler:() =>{
        return {resource:{test:true}}
      }
    }
  }
}

const main = async () => {
  const config = createConfig(path.resolve('../.env'));

  const mergedManifest = mergeModuleManifest(manifest,{entities:{Test:{attrs:{test:{type: "string"}}}}},
    {entities:{Baz:{attrs:{test:{type: "string"}}}}}, tt)
  const app = createApp(config, mergedManifest);
  if (!app) {
    console.error(`Unable to create app. Check config/manifest errors.`);
    process.exit(1);
  }
  await startApp(app);
};

if (require.main === module) {
  main();
}
