/**
 * Low-level http helper functions
 *
 * @module HTTP
 */

import http, { RequestListener, Server } from 'http';

export type TServer = Server;

export const createServer = (dispatch: RequestListener): TServer =>
    http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/aidbox') {
            dispatch(req, res);
            return;
        }
        res.end(`Ready`);
    });

export const startServer = (server: TServer, port = 8090, hostname = '0.0.0.0'): Promise<TServer> => {
    return new Promise((resolve, reject) => {
        server
            // wrap
            .on('error', reject)
            .listen(port, hostname, () => {
                console.log(`your server started on http://0.0.0.0:8090`);
                resolve(server);
            });
    });
};
