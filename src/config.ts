import {
  BaseConfig,
  ConfigSchema,
  ConfigSchemaProps,
  ProcessEnv,
} from "./types";
import * as dotenv from "dotenv";

const baseConfig: ConfigSchema = {
  app: {
    id: {
      env: "APP_ID",
      type: "string",
      required: true,
    },
    secret: {
      env: "APP_SECRET",
      type: "string",
      required: true,
    },
    port: {
      env: "APP_PORT",
      type: "number",
      required: true,
    },
    url: {
      env: "APP_URL",
      type: "string",
      required: true,
      stripSlashes: true,
    },
    maxBodySize: {
      env: "APP_MAX_BODY_SIZE",
      type: "number",
      default: 20971520,
    },
    callbackURL: {
      env: "APP_CALLBACK_URL",
      type: "string",
      default: "/aidbox",
    },
  },
  aidbox: {
    url: {
      env: "AIDBOX_URL",
      required: true,
      type: "string",
    },
    client: {
      env: "AIDBOX_CLIENT_ID",
      required: true,
      type: "string",
    },
    secret: {
      env: "AIDBOX_CLIENT_SECRET",
      required: true,
      type: "string",
    },
  },
};

export const createConfig = <T = BaseConfig>({
  envFilePath,
  customConfigSchema,
}: {
  customConfigSchema?: ConfigSchema;
  envFilePath?: string;
} = {}): T => {
  dotenv.config(envFilePath ? { path: envFilePath } : {});
  const errors: Array<[string, string]> = [];

  const prepareConfig = (schema: ConfigSchema, envs: ProcessEnv): T => {
    return Object.keys(schema).reduce((c, cur) => {
      if ("env" in schema[cur]) {
        const item = schema[cur] as ConfigSchemaProps;
        const name = item.env;
        let value: string | number | undefined = envs[name];

        if (item.required && !value) {
          errors.push([item.env, "Missed with type " + item.type]);
          return c;
        } else if (value && item.type === "number") {
          value = parseInt(value);
          if (isNaN(value)) {
            errors.push([
              item.env,
              `wrong value for number. expected: ${item.type} - received: ${envs[name]}`,
            ]);
            return c;
          }
        } else if (item.stripSlashes && value) {
          value = value.endsWith("/") ? value.slice(0, -1) : value;
        }
        return { ...c, [cur]: value || item.default };
      } else {
        return {
          ...c,
          [cur]: prepareConfig(schema[cur] as ConfigSchema, envs),
        };
      }
    }, {} as T);
  };
  const config = prepareConfig(
    { ...baseConfig, ...customConfigSchema },
    process.env
  );

  if (errors.length) {
    errors.forEach((error) => {
      console.error("Environment variable %s - %s", error[0], error[1]);
    });
    process.exit(1);
  }
  return config;
};
