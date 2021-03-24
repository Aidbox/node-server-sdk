![build status](https://github.com/aidbox/node-server-sdk/actions/workflows/chore.yaml/badge.svg)
[![npm version](https://badge.fury.io/js/%40aidbox%2Fnode-server-sdk.svg)](https://badge.fury.io/js/%40aidbox%2Fnode-server-sdk)
[![codecov](https://codecov.io/gh/Aidbox/node-server-sdk/branch/main/graph/badge.svg?token=1AF9MVTN3L)](https://codecov.io/gh/Aidbox/node-server-sdk)

# <img src="media/aidbox-logo.png" width="20px"/> Aidbox NodeJS Server SDK

Information about the types and methods used can be found in the documentation [at the link](https://aidbox.github.io/node-server-sdk/)

- [Installation](#installation)
- [Requirements](#requirements-for-using)
- [App Example](#app-example)
- [Additional notes](#additional)

## Installation

We have first-class TypeScript support. But you also can use this library in javascript project. We provide helpful function for prevent errors in input config variables

**npm**

```bash
npm install @aidbox/node-server-sdk
```

**yarn**

```bash
yarn add @aidbox/node-server-sdk
```

## Requirements

For start working with application you should pass required env variables

Client id with basic auth grant type for work with aidbox

> AIDBOX_CLIENT_ID=

Client secret

> AIDBOX_CLIENT_SECRET=secret

Your aidbox url

> AIDBOX_URL=http://0.0.0.0:8085

Toggle debug mode

> APP_DEBUG=false

App name for identity application in aidbox

> APP_ID=you-business-app

Secret for use application(aidbox will use)

> APP_SECRET=secret

Backend application url (aidbox will send request on this base url)

> APP_URL=http://0.0.0.0:8090

Port for your backend application

> APP_PORT=8090

## App example

### Typescript usage

Firstly you should create config. By default we use env variables you can optionally pass **process.env** as input parameter

```typescript
import { createConfig } from '@aidbox/node-server-sdk/lib/config';

const config = createConfig();
```

(optional) Add your specific context helpers

```typescript
type TContextHelpers = {
  greet(name: string): void;
};

const contextHelpers: TContextHelpers = {
  greet: (name: string) => {
    console.log(`Hello, ${name}`);
  },
};
```

Next step it defining manifest object. For example:

```typescript
import { TRawManifest } from '../src/types';

// pass type if your define your specific context helpers
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
        context.greet('Alice'); // your specific context helper
        return { resource: { work: true } };
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

After you prepare config and define manifest you can run you backend application.
Typescript don't allow you miss some required config key but we have additional check input parameters before creating app.

```typescript
import { createApp, startApp } from '@aidbox/node-server-sdk';

const app = createApp<TContextHelpers>(config, manifest, contextHelpers);
if (!app) {
  console.error(`Unable to create app. Check config/manifest errors.`);
  process.exit(1);
}

await startApp(app);
```

Then you can go in your Aidbox and find you created application in Apps menu
For test correct working you run this request in Aidbox Rest Console

**Request**

```
GET /$test-operation
```

**Response**

```yaml
work: true
```

Information about predefined context helpers and example usage you can find in [documentation](https://aidbox.github.io/node-server-sdk/)

Powered by [Health Samurai](http://www.health-samurai.io) | [Aidbox](http://www.health-samurai.io/aidbox) | [Fhirbase](http://www.health-samurai.io/fhirbase)
