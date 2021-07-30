import R from "ramda";
import Koa, { Middleware } from "koa";
import bodyParser from "koa-bodyparser";
import { TCtx } from "./ctx";
import { dispatch } from "./dispatch";
import { TMessage } from "./message";
import { parseError } from "./errors";
import { TManifest } from "./manifest";

const debug = require("debug")("@aidbox/server-sdk:app");

export type TApp = Koa<any, TAppCtx>;

export type TAppCtx = { aidbox: { ctx: TCtx; helpers: any } };

export const createApp = (ctx: TCtx, helpers?: any): TApp => {
  const app: TApp = new Koa();
  app.context.aidbox = { ctx, helpers };

  app.use(bodyParser());
  app.use(authMiddleware(ctx.manifest));
  app.use(dispatchMiddleware);

  return app;
};

export const startApp = async (app: TApp, port: number): Promise<void> => {
  const ctx = app.context.aidbox.ctx;
  const manifest = ctx.manifest;
  const describe = (obj: Record<string, any> = {}) => Object.keys(obj);
  debug("Syncing manifest v%s\n%O", manifest.apiVersion, {
    operations: describe(manifest.operations),
    subscriptions: describe(manifest.subscriptions),
    entities: describe(manifest.entities),
    resources: describe(manifest.resources),
  });
  await ctx.request({
    url: "/App",
    method: "PUT",
    data: { ...ctx.manifest, type: "app", resourceType: "App" },
  });
  await new Promise<void>((resolve) => app.listen(port, resolve));
  debug("App started on port %d", port);
};

const authMiddleware = (manifest: TManifest): Middleware<any, TAppCtx> => {
  const appId = manifest.id;
  const appSecret = manifest.endpoint.secret;
  const appToken = Buffer.from(`${appId}:${appSecret}`).toString("base64");

  return async (ctx, next) => {
    const header = ctx.request.headers.authorization;
    const token = header && R.last(R.split(" ", header));
    if (token === appToken) {
      return next();
    }
    ctx.status = 401;
    ctx.body = { error: `Authorization failed for app ${appId}` };
  };
};

const dispatchMiddleware: Middleware<any, TAppCtx> = async (ctx) => {
  const message = ctx.request.body as TMessage;
  try {
    const { resource, text } = await dispatch(
      ctx.aidbox.ctx,
      message,
      ctx.aidbox.helpers
    );
    ctx.body = resource || text;
  } catch (err) {
    console.error(err);
    const { status, error } = parseError(err);
    ctx.status = status;
    ctx.body = { error };
  }
};
