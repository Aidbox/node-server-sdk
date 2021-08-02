import { TPatientResource } from "@aidbox/server-sdk";
import { TSubscription } from "./helpers";

export const Patient: TSubscription<TPatientResource> = {
  handler: "Patient",
  handlerFn: async (event, { ctx, helpers }) => {
    const { resource: patient, previous } = event;
    console.log('Handling subscription "Patient"');
    console.log({ patient, previous });
    return { status: 500 };
  },
};
