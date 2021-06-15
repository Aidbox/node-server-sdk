/**
 * Main dispatch function with additional helpers
 *
 * @module Dispatch
 */

import assert from 'assert';
import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import yaml from 'js-yaml';
import {
    EAccept,
    EMessageType,
    TConfig,
    TContext,
    TMessage,
    TOperationMessage,
    TPatchedManifest,
    TSubscriptionHandlers,
    TSubscriptionMessage,
} from '../types';

export type TDispatch = <T>(
    config: TConfig,
    manifest: TPatchedManifest<T>,
    context: TContext<T>,
    subscriptionHandlers: TSubscriptionHandlers<T>
) => RequestListener;

export const createDispatch: TDispatch = (config, manifest, context, subscriptionHandlers) => async (req, res) => {
    const sendResponse = sendRes(res);
    try {
        const message = await parseReq(req);
        res.setHeader('Content-Type', resolveContentType(message));

        if (!checkAuthHeader(config.APP_ID, config.APP_SECRET, req.headers.authorization)) {
            throw new Error('Unauthorized');
        }

        if (message.type === EMessageType.SUBSCRIPTION) {
            const subMessage = message as TSubscriptionMessage;
            const handler = subscriptionHandlers[subMessage.handler];
            const json = await handler(context, subMessage);
            sendResponse(JSON.stringify(json));
        } else if (message.type === EMessageType.OPERATION) {
            const opMessage = message as TOperationMessage;
            const operationId = opMessage.operation.id;
            const operation = manifest.operations?.[operationId];
            assert.ok(operation, `Operation ${operationId} not found`);
            const { handler } = operation;
            const { status, headers, resource, body } = await handler(context, opMessage);
            if (opMessage.request.headers.accept === 'text/yaml') {
                sendResponse(yaml.dump(resource, { noRefs: true }), status, headers);
            } else if (body) {
                sendResponse(body, status, headers);
            } else {
                sendResponse(JSON.stringify(resource), status, headers);
            }
        } else {
            throw new Error(`Unknown message type: ${message.type}`);
        }
    } catch (err: any) {
        if (err.isAxiosError) {
            return sendResponse(JSON.stringify(err.response.data), err.response.status);
        }
        const status = err.message === 'Unauthorized' ? 403 : 500;
        return sendResponse(err.message, status);
    }
};

const sendRes = (res: ServerResponse) => (text: string, statusCode = 200, headers: Record<string, string> = {}) => {
    res.statusCode = statusCode;
    Object.keys(headers).forEach((k: string) => res.setHeader(k, headers[k]));
    res.end(text);
};

const parseReq = (req: IncomingMessage): Promise<TMessage> => {
    return new Promise((resolve, reject) => {
        let text = '';
        req.on('error', reject)
            .on('data', (chunk) => (text += chunk))
            .on('end', () => {
                try {
                    const json = JSON.parse(text);
                    resolve(json as TMessage);
                } catch (err) {
                    reject(err);
                }
            });
    });
};

const resolveContentType = (message: TMessage) => {
    switch (message.request?.headers?.accept) {
        case EAccept.YAML:
        case EAccept.TEXT:
            return message.request.headers.accept;
        default:
            return EAccept.JSON;
    }
};

const checkAuthHeader = (appId: string, appSecret: string, authHeader?: string) => {
    if (!authHeader) {
        return false;
    }
    const [auth] = authHeader.split(' ').slice(1, 2);
    return auth === Buffer.from(`${appId}:${appSecret}`).toString('base64');
};
