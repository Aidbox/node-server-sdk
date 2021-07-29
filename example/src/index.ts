import dotenv from "dotenv";
import { createCtx, createApp, startApp } from "@aidbox/server-sdk";
import { createHelpers } from "./helpers";
import * as operations from "./operations";
import * as subscriptions from "./subscriptions";
import * as entities from "./entities";
import * as resources from "./resources";

const main = async () => {
  dotenv.config();
  // Init app
  const ctx = createCtx({
    manifest: { operations, subscriptions, entities, resources, apiVersion: 2 },
  });
  const helpers = createHelpers(ctx);
  const app = createApp(ctx, helpers);
  // Start app
  const port = +(process.env.APP_PORT || process.env.PORT || 3000);
  await startApp(app, port);
};

if (require.main === module) {
  main();
}
