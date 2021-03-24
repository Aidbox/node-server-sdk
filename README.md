![build status](https://github.com/aidbox/node-server-sdk/actions/workflows/chore.yaml/badge.svg)
[![npm version](https://badge.fury.io/js/%40aidbox%2Fnode-server-sdk.svg)](https://badge.fury.io/js/%40aidbox%2Fnode-server-sdk)
[![codecov](https://codecov.io/gh/Aidbox/node-server-sdk/branch/main/graph/badge.svg?token=1AF9MVTN3L)](https://codecov.io/gh/Aidbox/node-server-sdk)

# <img src="media/aidbox-logo.png" width="20px"/> Aidbox NodeJS Server SDK

You can find additional technical information on SDK types and methods used [here](https://aidbox.github.io/node-server-sdk/).

- [Installation](#installation)
- [Requirements](#requirements-for-using)
- [App Example](#app-example)
- [Additional notes](#additional)

## Installation

We have first-class TypeScript support, but this library can also be used in a javascript project. We provide a useful function to prevent errors in input config variables.

**npm**

```npm
npm install @aidbox/node-server-sdk
```

**yarn**

```yarn
yarn add @aidbox/node-server-sdk
```

## Requirements

To start working with the backend application you should enter the required env variables:

Client id with basic auth grant type to work with aidbox:

> AIDBOX_CLIENT_ID=

Client secret:

> AIDBOX_CLIENT_SECRET=secret

Your aidbox url:

> AIDBOX_URL=http://0.0.0.0:8085

Toggle debug mode:

> APP_DEBUG=false

App name to identify the application in aidbox:

> APP_ID=you-business-app

Secret for use application (aidbox will use it):

> APP_SECRET=secret

Backend application url (aidbox will send a request to this base url):

> APP_URL=http://0.0.0.0:8090

Port for your backend application:

> APP_PORT=8090

## App example

### Typescript usage

Firstly, you should create a config object. By default, we use env variables but you can optionally enter **process.env** as an input parameter.

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

Next step is defining the manifest object. For example:

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

After you prepare the config object and define the manifest, you can run your backend application.
Typescript won't let you miss any required config keys. There are additional check input parameters before the app is created:

```typescript
import { createApp, startApp } from '@aidbox/node-server-sdk';

const app = createApp<TContextHelpers>(config, manifest, contextHelpers);
if (!app) {
  console.error(`Unable to create app. Check config/manifest errors.`);
  process.exit(1);
}

await startApp(app);
```

Then you can go to your Aidbox. There you will find your new application in the Apps menu.
To test the app, run this request in the Aidbox Rest Console:

**Request**

```http
GET /$test-operation
```

**Response**

```yaml
work: true
```

You can find more information about predefined context helpers and example usage [here](https://aidbox.github.io/node-server-sdk/).

Powered by [Health Samurai](http://www.health-samurai.io) | [Aidbox](http://www.health-samurai.io/aidbox) | [Fhirbase](http://www.health-samurai.io/fhirbase)
