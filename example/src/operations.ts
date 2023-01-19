import { NotFoundError, ValidationError } from "@aidbox/node-server-sdk";
import * as assert from "assert";
import { createOperation } from "./aidbox";

export const createPatient = createOperation<{
  // Typing "resource" (POST payload)
  resource: {
    name: string;
    active: boolean;
  };
  // Optionally typing query/route params & form payload
  params: {
    foo: string;
  };
  "form-params": {
    foo: string;
  };
  "route-params": {
    foo: string;
  };
}>({
  method: "POST",
  path: ["createPatient"],
  handlerFn: async (req, { ctx }) => {
    const {
      // "resource" contains POST payload
      resource,
      // "params", "form-params" & "route-params" are also accessible
      params,
      "form-params": formParams,
      "route-params": routeParams,
    } = req;
    assert.ok(resource, new ValidationError("resource required"));
    const { active, name } = resource;

    assert.ok(
      typeof active !== "undefined",
      new ValidationError('"active" required')
    );
    assert.ok(name, new ValidationError('"name" required'));

    const patient = await ctx.api.createResource("Patient", {
      active: active,
      name: [{ text: name }],
    });
    return { resource: patient };
  },
});

export const test = createOperation<{ resource: { active: boolean } }>({
  method: "GET",
  path: ["test"],
  handlerFn: async (req, { ctx, helpers }) => {
    // Test helpers
    console.log("Testing helpers");
    console.log({ result1: helpers.helper1(), result2: helpers.helper2() });

    // Test log
    console.log("Testing log");
    await ctx.log({
      message: { error: "Testing log" },
      v: "2020.02",
      fx: "testOperation",
      type: "backend-test",
    });

    return { status: 200 };
  },
});

export const testError = createOperation<{ params: { type: string } }>({
  method: "GET",
  path: ["testError"],
  handlerFn: async (req, { ctx }) => {
    switch (req.params.type) {
      case "ValidationError":
        throw new ValidationError("Testing ValidationError");
      case "NotFoundError":
        throw new NotFoundError("Something", {
          foo: "foo",
          bar: "bar",
        });
      case "AxiosError":
        await ctx.request({ url: "http://xxx" });
        return {};
      default:
        throw new Error("Testing default error");
    }
  },
});

export const testApi = createOperation<{ params: { type: string } }>({
  method: "GET",
  path: ["testApi"],
  handlerFn: async (req, { ctx }) => {
    const { resources: patients } = await ctx.api.findResources<any>("Patient");

    const patient = !patients.length
      ? null
      : await ctx.api.getResource<any>("Patient", patients[0].id);

    console.log({ patients, patient });
    return { resource: { patients, patient } };
  },
});

export const testPsql = createOperation({
  method: "GET",
  path: ["test-psql"],
  handlerFn: async (req, { ctx }) => {
    const result = await ctx.psql("select * from attribute limit 1");
    return { resource: result };
  },
});

export const testSql = createOperation({
  method: "GET",
  path: ["test-sql"],
  handlerFn: async (req, { ctx }) => {
    const result = await ctx.sql(
      "select * from attribute where resource->>'module' = ? limit 1",
      ["fhir-4.0.0"]
    );
    console.log(result);
    return { resource: result };
  },
});

export const testBundle = createOperation({
  method: "GET",
  path: ["test-bundle"],
  handlerFn: async (req, { ctx }) => {
    const result = await ctx.api.createBundle("batch", [
      {
        request: { method: "POST", url: "/Patient" },
        resource: { resourceType: "Patient" },
      },
    ]);
    console.log(result);
    return { resource: result };
  },
});
