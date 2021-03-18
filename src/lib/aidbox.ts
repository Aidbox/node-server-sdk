import * as http from "http";

import {InitManifest, ProcessEnv, ServerConfig} from "../types";



export const prepareConfig = (envs: ProcessEnv): ServerConfig =>{
  const {
    APP_DEBUG, AIDBOX_URL, AIDBOX_CLIENT_ID, AIDBOX_CLIENT_SECRET,
    APP_ID, APP_URL, APP_PORT, APP_SECRET, PGUSER, PGHOST,
    PGDATABASE, PGPASSWORD
  } = envs;

  return {
    APP_DEBUG,
    AIDBOX_URL,
    AIDBOX_CLIENT_ID,
    AIDBOX_CLIENT_SECRET,
    APP_ID,
    APP_URL,
    APP_PORT,
    APP_SECRET,
    PGUSER,
    PGHOST,
    PGDATABASE,
    PGPASSWORD
  }
}

const validateConfig = (config:ServerConfig) =>{
  type configKey = keyof typeof config;
  const missingParameters = Object.keys(config).map((key) => {
    const value = config[key as configKey];
    if (value === '' || value === undefined) {
      return key;
    }
    return
  }).filter(k => k);

  if (Object.keys(missingParameters).length > 0) {
   return {error: `Missing variables ${missingParameters.toString()}`};
  }
  return;
}



export const startServer = (config: ServerConfig, manifest: InitManifest):Promise<void> =>{
  const validConfig = validateConfig(config);
  if(validConfig?.error){
    return Promise.reject(validConfig.error);
  }
  console.log(manifest)
  return new Promise((resolve) => {
    const server = http.createServer((req, resp) => {
      if (req.url === '/aidbox'){
        // this.#dispatch(req, resp);
      }
      if(req.method === 'GET'){
        resp.end(`Ready`);
      }

    });
    server.on('error', (err) => {
     console.log(err)
    });
    server.listen(8090, '0.0.0.0', () => {
      console.log(`server started on https://0.0.0.0:8090`)
      resolve()
    })

  })
}
