import {InitManifest} from "./build/main/types";
import {prepareConfig, startServer} from "./src";

const config = prepareConfig(process.env);

const manifest: InitManifest = {
  resources: {
    AccessPolicy: {},
  },
  entities: {},
  operations: {
    test: {
      method: 'GET',
      path: ['$test-operation'],
      handler: async() => {
        return {
          resource: {
            test: 'work'
          }
        }
      }
    }
  },
  subscriptions: {},
};

startServer(config, manifest).then(() => console.log('ready')).catch(e => console.log('error: ', e));
