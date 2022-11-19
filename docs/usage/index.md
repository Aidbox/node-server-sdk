# Usage
For start working with Aidbox by App API you should make some steps.


- Fill out `.env` file
- Create config ([Documentation](./config.md))
   ```js
    const config = createConfig();
   ```
- Create context
  ```js
  const ctx = createCtx({
    config,
    manifest: { operations, subscriptions, entities, resources, apiVersion: 2 },
  });
  ```
- (Optionally) Create your own helpers
  ```js
  const helpers = createHelpers(ctx);
  ```
- Create application
  ```js
  const app = await createApp({config,helpers,ctx});
  ```
- Start application
  ```js
  await startApp(app, config, ctx);
  ```


