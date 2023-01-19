import { createSubscription } from "./aidbox";
import { Patient } from "./aidbox-types";

export const subscribePatient = createSubscription<Patient>({
  handler: "subscribePatient",
  handlerFn: async (event, { ctx, helpers }) => {
    const { resource: patient, previous } = event;
    console.log('Handling subscription "Patient"');
    console.log({ patient, previous });
    return { status: 500 };
  },
});
