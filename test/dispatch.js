const { dispatch } = require("..");
const sinon = require("sinon");

beforeEach(() => {
  sinon.restore();
});

describe("dispatch", () => {
  it("Passes request & dispatchProps to operation handler", async () => {
    const handlerFnSpy = sinon.spy();
    const dispatchProps = {
      ctx: { manifest: { operations: { xxx: { handlerFn: handlerFnSpy } } } },
    };
    const request = {
      resource: { xxx: "xxx" },
    };
    await dispatch(
      { type: "operation", operation: { id: "xxx" }, request },
      dispatchProps
    );
    sinon.assert.calledWith(handlerFnSpy, request, dispatchProps);
  });

  it("Passes event & dispatchProps to subscription handler", async () => {
    const handlerFnSpy = sinon.spy();
    const dispatchProps = {
      ctx: {
        manifest: { subscriptions: { xxx: { handlerFn: handlerFnSpy } } },
      },
    };
    const event = { resource: "xxx", previous: "xxx", action: "create" };
    await dispatch(
      { type: "subscription", handler: "xxx", event },
      dispatchProps
    );
    sinon.assert.calledWith(handlerFnSpy, event, dispatchProps);
  });
});
