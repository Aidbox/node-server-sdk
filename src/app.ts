import Koa, { Middleware } from "koa";
import bodyParser from "koa-bodyparser";
import { dispatch } from "./dispatch";
import { parseError } from "./errors";
import { Server } from "http";
import {
  App,
  BundledApp,
  Ctx,
  DispatchProps,
  Manifest,
  Message,
} from "./types";
import * as os from "os";
import {
  HealthEndpoint,
  ReadinessEndpoint,
  LivenessEndpoint,
} from "./healthcheck";
import Router from "koa-router";
import { HealthChecker } from "@cloudnative/health";
import { shutdownMiddleware } from "./graceful-shutdown";
import * as http from "http";

const debug = require("debug")("@aidbox/node-app:app");

export const createApp = (dispatchProps: DispatchProps): BundledApp => {
  const app: App = new Koa();
  const server = http.createServer(app.callback());

  app.context.ctx = dispatchProps.ctx;
  const router = new Router();

  app.use(bodyParser({ jsonLimit: "25mb" }));

  const healthcheck = new HealthChecker();

  app.use(shutdownMiddleware(server));
  router.get("/live", LivenessEndpoint(healthcheck));
  router.get("/ready", ReadinessEndpoint(healthcheck));
  router.get("/health", HealthEndpoint(healthcheck));
  router.post(
    "/aidbox",
    authMiddleware(dispatchProps.ctx.manifest),
    dispatchMiddleware(dispatchProps)
  );

  app.use(router.routes());
  return { app, server };
};

export const startApp = async (
  { app, server }: BundledApp,
  port: number
): Promise<Server> => {
  const ctx = app.context.ctx;
  const manifest = ctx.manifest;
  const describe = (obj: Record<string, any> = {}) => Object.keys(obj);
  debug("Syncing manifest v%s\n%O", manifest.apiVersion, {
    operations: describe(manifest.operations),
    subscriptions: describe(manifest.subscriptions),
    entities: describe(manifest.entities),
    resources: describe(manifest.resources),
  });
  await ctx
    .request({
      url: "/App",
      method: "PUT",
      data: { ...manifest, type: "app", resourceType: "App" },
    })
    .then(() => {
      debug("Manifest has been updated");
    })
    .catch((error: any) => {
      if (error.response?.data) {
        debug(
          "Manifest sync failed: %s\n%O",
          error.response.status,
          JSON.stringify(error.response.data)
        );
      }
      throw error;
    });

  return await new Promise<Server>((resolve) => {
    server.listen(port, () => {
      debug("App started on port %d", port);
    });
    resolve(server);
  });
};

const authMiddleware = (manifest: Manifest): Middleware => {
  const appId = manifest.id;
  const appSecret = manifest.endpoint.secret;
  const appToken = Buffer.from(`${appId}:${appSecret}`).toString("base64");

  return async (ctx, next) => {
    const header = ctx.request.headers.authorization;
    const token = header && header?.split(" ")?.[1];
    if (token === appToken) {
      return next();
    }
    ctx.status = 401;
    ctx.body = { error: `Authorization failed for app ${appId}` };
  };
};

const dispatchMiddleware =
  (dispatchProps: DispatchProps): Middleware =>
  async (ctx) => {
    const message = ctx.request.body as Message;
    try {
      const { resource, text, status, headers } = await dispatch(
        message,
        dispatchProps
      );
      ctx.body = resource || text;
      ctx.status = status || 200;
      if (typeof headers === "object" && Object.keys(headers).length) {
        ctx.set(headers);
      }
    } catch (err) {
      const { status, error } = parseError(err as Error);
      ctx.status = status;
      ctx.body = { error };
    }
  };
