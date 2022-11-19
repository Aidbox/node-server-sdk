import Fastify, { type FastifyInstance } from "fastify";
import { dispatch } from "./dispatch";
import { parseError } from "./errors";
import { BaseConfig, Ctx, Message } from "./types";
import GracefulServer from "@gquittet/graceful-server";
import YAML from "yaml";
import fastifyHealthcheck from "fastify-custom-healthcheck";

type CreateAppOptions<T, H> = {
  config: T;
  loggerEnabled?: boolean;
  ctx: Ctx;
  helpers?: H;
};

export const createApp = async <T extends BaseConfig, H = {}>({
  ctx,
  helpers,
  config,
  loggerEnabled = true,
}: CreateAppOptions<T, H>): Promise<FastifyInstance> => {
  const app = Fastify({
    bodyLimit: config.app.maxBodySize,
    logger: loggerEnabled,
  });

  await app.register(fastifyHealthcheck);

  app.route({
    method: "POST",
    url: "/aidbox",
    preHandler: (request, reply, done) => {
      if (!request.headers.authorization) {
        reply.statusCode = 401;
        return reply.send({
          error: { message: `Authorization header missing` },
        });
      }
      const appId = config.app.id;
      const appSecret = config.app.secret;
      const appToken = Buffer.from(`${appId}:${appSecret}`).toString("base64");
      const header = request.headers.authorization;
      const token = header && header?.split(" ")?.[1];
      if (token === appToken) {
        return done();
      }
      reply.statusCode = 401;
      reply.send({
        error: { message: `Authorization failed for app [${appId}]` },
      });
    },
    handler: (request, reply) => {
      const targetContent =
        (request.body as Record<string, any>)?.request?.headers["accept"] ??
        "application/json";
      return dispatch(request.body as Message, { ctx, helpers })
        .then(({ resource, text, status, headers }) => {
          reply.statusCode = status || 200;
          if (typeof headers === "object" && Object.keys(headers).length) {
            reply.headers(headers);
          }
          if (text) {
            reply.header("content-type", "text/plain");
            return reply.send(text);
          }
          switch (targetContent) {
            case "text/yaml":
              reply.header("content-type", "text/yaml");
              return reply.send(YAML.stringify(resource));
            default:
              return reply.send(resource);
          }
        })
        .catch((err) => {
          const { status, error } = parseError(err as Error);
          reply.statusCode = status;
          return reply.send({ error });
        });
    },
  });

  return app;
};

export const startApp = async (
  app: FastifyInstance,
  { app: { port } }: BaseConfig,
  ctx: Ctx
) => {
  const gracefulServer = GracefulServer(app.server);

  gracefulServer.on(GracefulServer.READY, () => {
    console.log("Server is ready");
  });

  gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
    console.log("Server is shutting down");
  });

  gracefulServer.on(GracefulServer.SHUTDOWN, (error) => {
    console.log("Server is down because of", error.message);
  });

  const { manifest } = ctx;
  const describe = (obj: Record<string, any> = {}) => Object.keys(obj);
  console.log("Syncing manifest v%s\n%O", manifest.apiVersion, {
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
      app.log.info("Manifest has been updated");
    })
    .catch((error: any) => {
      if (error.response?.data) {
        app.log.error(
          "Manifest sync failed: %s\n%O",
          error.response.status,
          JSON.stringify(error.response.data)
        );
      }
      throw error;
    });

  app.listen({ port, host: "0.0.0.0" }, function (err) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    gracefulServer.setReady();
  });
};
