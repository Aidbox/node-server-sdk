# Aidbox NodeJS Server SDK

- [Installation](#installation)
- [Requirements](#requirements-for-using)
- [Start application](#start-application)

## Installation

We have first-class TypeScript support. But you also can use this library in javascript project

if you use npm

```npm
 npm install @aidbox/node-server-sdk
```

or yarn

```npm
 yarn add @aidbox/node-server-sdk
```

## Requirements for using

Before run you application you should full required ENV-variables

Client id for work with aidbox

> AIDBOX_CLIENT_ID=

Client secret for work with aidbox

> AIDBOX_CLIENT_SECRET=secret

URL

> AIDBOX_URL=http://0.0.0.0:8085

Toggle debug mode

> APP_DEBUG=false

App name for identity application in aidbox

> APP_ID=you-business-app

Secret (aidbox will use )

> APP_SECRET=secret

Backend application url (aidbox will send request on this base url)

> APP_URL=http://0.0.0.0:8090

Port for your backend application

> APP_PORT=8090

## Start application

Firstly you should prepare config object

```typescript
import { prepareConfig } from '../src/lib/config';

const config = prepareConfig(process.env);
```

Next step in define manifest file. For example:

```typescript
import { TRawManifest } from '../src/types';

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
    Patient: {
      handler: () => {
        console.log('qwerty');
        return true;
      },
    },
  },
};
```

After you prepare config and define manifest you can run you backend application

```typescript
import { startApp } from '../src/lib/app';

const config = prepareConfig(process.env);

startApp(config, manifest)
  .then(() => console.log('ready'))
  .catch((e) => console.log('error: ', e));
```

**Powered by [Health Samurai](http://www.health-samurai.io) | [Aidbox](http://www.health-samurai.io/aidbox) | [Fhirbase](http://www.health-samurai.io/fhirbase)**
