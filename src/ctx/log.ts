import { Client, LogHandler } from "../types";

export const createLog =
  (client: Client): LogHandler =>
  (data) => {
    client
      .request({ url: `/$loggy`, method: "POST", data })
      .catch((e) => console.error("Log message not send"));
  };
