import axios from "axios";
import { BaseConfig, Client, ClientProps } from "./types";

export const createClient = ({
  url,
  client,
  secret,
}: BaseConfig["aidbox"]): Client => {
  return axios.create({
    baseURL: url,
    auth: {
      username: client,
      password: secret,
    },
  });
};
