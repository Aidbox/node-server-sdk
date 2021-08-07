const sinon = require("sinon");
const supertest = require("supertest");
const { createApp, startApp } = require("..");

const appId = "xxx";
const appSecret = "yyy";
const manifest = {
  id: appId,
  endpoint: { secret: appSecret },
  operations: {
    xxx: {
      method: "POST",
      path: ["xxx"],
    },
  },
};

beforeEach(() => {
  sinon.restore();
});

describe("app", () => {
  describe("createApp", () => {
    it("Applies auth/dispatch middleware", async () => {
      const handlerSpy = sinon.spy(() => ({ resource: "xxx" }));
      const operations = {
        xxx: {
          method: "POST",
          path: ["xxx"],
          handlerFn: handlerSpy,
        },
      };
      const ctx = { manifest: { ...manifest, operations } };
      const app = createApp({ ctx });
      const req = supertest(app.callback());
      const message = { type: "operation", operation: { id: "xxx" } };

      // Without token
      await req.post("/aidbox").send(message).expect(401);
      sinon.assert.notCalled(handlerSpy);

      // With invalid token
      await req
        .post("/aidbox")
        .set("Authorization", `Bearer xxx`)
        .send(message)
        .expect(401);
      sinon.assert.notCalled(handlerSpy);

      // With valid token
      const token = Buffer.from(`${appId}:${appSecret}`).toString("base64");
      await req
        .post("/aidbox")
        .set("Authorization", `Bearer ${token}`)
        .send(message)
        .expect(200, "xxx");
      sinon.assert.calledOnce(handlerSpy);
    });
  });
  describe("startApp", () => {
    it("Syncs manifest & starts http server", async () => {
      const requestSpy = sinon.spy();
      const ctx = { request: requestSpy, manifest };
      const app = createApp({ ctx });
      const listenStub = sinon.stub(app, "listen").callsArg(1);
      const port = 1337;
      await startApp(app, port);
      sinon.assert.calledWithMatch(requestSpy, {
        url: "/App",
        method: "PUT",
        data: ctx.manifest,
      });
      sinon.assert.calledWith(listenStub, port);
    });
  });
});
