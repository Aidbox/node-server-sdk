# Healthcheck Probes

## Endpoints

- `/live` - just show uptime for node process
- `/ready` - available when web server started. YOu should this for startupProbe in Kubernetes
- `/health` - return detailed healthcheck information(can be extended by user)

## Health

Application serve responses that report about the web application, if it's still running and alive (health checks).
This is very useful with Containers like Docker and orchestrators like Kubernetes.

You can add your custom healthchecks by using `app` returned from `createApp` function.

Input params:

| Argument   |         Type         | Required | Description                                                                                                                                                                  |
|------------|:--------------------:|---------:|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| label      |        string        |     true |                                                                                                                                                                              |
| fn         | PromiseLike function |     true | Should return Promise.reject  for produce unhealthy value                                                                                                                    |
| evaluation |       are neat       |    false | when computing health check an equality check happens between evaluation and the value returned by the health check function. If the values are different health check fails |

Example:

```typescript
import {createConfig, createApp, startApp} from "@aidbox/node-server-sdk";

const config = createConfig();
const app = await createApp({config, loggerEnbaled: true});

app.addHealthCheck("mongo", async () => {
  const client = await MongoClient.connect(url);
  client.db('example');
  client.close();
})
await startApp(app);
```

Example response:

```json
{
  "healthChecks": {
    "mongo": {
      "status": "FAIL",
      "reason": "MongoNetworkError: failed to connect to server [localhost:27017] on first connect [Error: connect ECONNREFUSED 127.0.0.1:27017\n    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1144:16) {\n  name: 'MongoNetworkError'\n}]"
    }
  },
  "stats": {
    "creationTime": "2020-08-04T19:16:29.766Z",
    "uptime": 0.303361107,
    "memory": {
      "rss": 50102272,
      "heapTotal": 29270016,
      "heapUsed": 16499104,
      "external": 20754444,
      "arrayBuffers": 19273278
    }
  }
}

```
