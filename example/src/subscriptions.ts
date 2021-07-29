import { TManifestSubscription, TPatientResource } from "@aidbox/server-sdk";

export const Patient: TManifestSubscription<TPatientResource> = {
  handler: "Patient",
  handlerFn: async (ctx, msg) => {
    const { resource: patient, previous } = msg;
    console.log('Handling subscription "Patient"');
    console.log({ patient, previous });
    return { status: 500 };
  },
};
