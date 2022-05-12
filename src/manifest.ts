import assert from "assert";
import { BaseConfig, Manifest, ManifestProps } from "./types";

export const createManifest = (
  manifest: ManifestProps,
  config: BaseConfig
): Manifest => {
  return {
    id: config.app.id,
    apiVersion: manifest.apiVersion || 1,
    endpoint: {
      type: "http-rpc",
      secret: config.app.secret,
      url: `${config.app.url}${
        config.app.callbackURL.startsWith("/")
          ? config.app.callbackURL
          : `/${config.app.callbackURL}`
      }`,
    },
    ...manifest,
  };
};
