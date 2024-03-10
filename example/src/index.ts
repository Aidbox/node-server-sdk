import * as dotenv from "dotenv";
import { createCtx, createApp, startApp } from "@aidbox/node-server-sdk";
import { createHelpers } from "./helpers";
import * as operations from "./operations";
import * as subscriptions from "./subscriptions";
import * as entities from "./entities";
import * as resources from "./resources";
import { createConfig } from "@aidbox/node-server-sdk";

const main = async () => {
  //   app1.listen(8081, function () {
  //     console.log('server running at ', 8081);
  // });

  try {
    const config = createConfig();

    const ctx = createCtx({
      config,
      manifest: { operations, subscriptions, entities, resources, apiVersion: 2 },
    });
    console.log("operations",operations);
    const helpers = createHelpers(ctx);
    const app1 = createApp({ ctx, helpers }, config);

    if (!app1) {
      console.error("unable to create application");
      process.exit(1);
    }
    const port = +(process.env.APP_PORT || 8081);
    await startApp(app1, port);
  } catch (err: any) {
    console.log("data", err.response.config.data);
    console.log("err",err.response.data);
  }
};

if (require.main === module) {
  main();
}
