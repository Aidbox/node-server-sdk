import { Client, ClientRequestProps, RequestHandler } from '../types';


export const createRequest =
  (client: Client): RequestHandler =>
  (props: ClientRequestProps) => {
    return client.request(props);
  };
