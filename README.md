# Aidbox NodeJS Server SDK

Ниже вы можете найти примеры использования 
- [Installation](#installation)
- [Requirements](#requirements-for-using)
 

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
> AIDBOX_URL=http://<ip>:8085

Toggle debug mode
>  APP_DEBUG=false

App name for identity application in aidbox
>  APP_ID=you-business-app

Secret (aidbox will use )
>  APP_SECRET=secret

Backend application url (aidbox will send request on this base url)
>  APP_URL=http://0.0.0.0:8090 

Port for your backend application
>  APP_PORT=8090 





