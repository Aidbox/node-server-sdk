import { TSubscription } from "./helpers";

export const Patient: TSubscription<any> = {
  handler: "Patient",
  handlerFn: async (event, { ctx, helpers }) => {
    const { resource: patient, previous } = event;
    console.log('Handling subscription "Patient"');
    console.log({ patient, previous });
    return { status: 500 };
  },
};
