import assert from "assert";
import {
  NotFoundError,
  TManifestOperation,
  TPatientResource,
  ValidationError,
} from "@aidbox/server-sdk";
import { THelpers } from "./helpers";

export const test: TManifestOperation<{ active: boolean }, THelpers> = {
  method: "POST",
  path: ["test"],
  handlerFn: async (ctx, req, helpers) => {
    // Test helpers
    console.log("Testing helpers");
    const { resources: patients, total: patientsTotal } =
      await helpers.findResources<TPatientResource>("Patient", {
        _sort: "-createdAt",
        _count: 3,
      });
    console.log({ patientsTotal, patients });

    // Test log
    console.log("Testing log");
    await ctx.log({
      message: { error: "Testing log" },
      v: "2020.02",
      fx: "testOperation",
      type: "backend-test",
    });

    // Test query
    console.log("Testing query");
    const { rowCount, rows } = await ctx.query(
      "SELECT * FROM patient WHERE id=$1",
      ["d60c37ec-e5c3-4ac0-9c1c-e5239e601a08"]
    );
    console.log({ rowCount, rows });

    // Test request
    console.log("Testing request");
    const patientInput = req.resource;
    assert.ok(patientInput);
    const { data: patient } = await ctx.request({
      url: "/Patient",
      method: "POST",
      data: { active: patientInput.active },
    });
    console.log({ patient });

    return { resource: patient };
  },
};

export const testError: TManifestOperation = {
  method: "GET",
  path: ["testError"],
  handlerFn: async (ctx, req) => {
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
};
