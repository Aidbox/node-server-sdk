import R from "ramda";
import Koa, { Middleware } from "koa";
import bodyParser from "koa-bodyparser";
import { TCtx } from "./ctx";
import { dispatch } from "./dispatch";
import { TMessage } from "./message";
import { AidboxError } from "./errors";

const debug = require("debug")("@aidbox/server-sdk:app");

export type TApp = Koa<any, TAppCtx>;
export type TAppCtx = { aidbox: { ctx: TCtx; helpers: any } };

export const createApp = (ctx: TCtx, helpers?: any): TApp => {
  const app: TApp = new Koa();
  app.context.aidbox = { ctx, helpers };

  app.use(bodyParser());
  app.use(authMiddleware);
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

const authMiddleware: Middleware<any, TAppCtx> = async (ctx, next) => {
  const manifest = ctx.aidbox.ctx.manifest;
  const appId = manifest.id;
  const appSecret = manifest.endpoint.secret;
  const fail = () => {
    ctx.status = 401;
    ctx.body = { error: `Authorization failed for app ${appId}` };
  };
  const authHeader = ctx.request.headers.authorization;
  if (!authHeader) {
    return fail();
  }
  const authToken = R.last(R.split(" ", authHeader));
  const expectedToken = Buffer.from(`${appId}:${appSecret}`).toString("base64");
  if (authToken !== expectedToken) {
    return fail();
  }
  return next();
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
    if (err instanceof AidboxError) {
      ctx.status = 422;
      ctx.body = { error: R.pick(["type", "message", "data"], err) };
    } else if (err.isAxiosError && err.response) {
      ctx.status = err.response.data.status;
      ctx.body = {
        error: {
          type: "AxiosError",
          message: err.message,
          data: err.response.data.issue,
        },
      };
    } else {
      ctx.status = 500;
      ctx.body = { error: { message: err.message } };
    }
  }
};
