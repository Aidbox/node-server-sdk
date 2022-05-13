import * as dotenv from "dotenv";
import { createCtx, createApp, startApp } from "@aidbox/node-server-sdk";
import { createHelpers } from "./helpers";
import * as operations from "./operations";
import * as subscriptions from "./subscriptions";
import * as entities from "./entities";
import * as resources from "./resources";
import { createConfig } from "@aidbox/node-server-sdk";

const main = async () => {
  const config = createConfig();
  // Init app
  const ctx = createCtx({
    config,
    manifest: { operations, subscriptions, entities, resources, apiVersion: 2 },
  });
  const helpers = createHelpers(ctx);
  const app = createApp({ ctx, helpers }, config);
  // Start app
  const port = +(process.env.APP_PORT || process.env.PORT || 3000);
  await startApp(app, port);
};

if (require.main === module) {
  main();
}
