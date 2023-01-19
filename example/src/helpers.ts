export const createHelpers = () => {
  return {
    helper1: () => "helper1",
    helper2: () => "helper2",
  };
};

export type Helpers = ReturnType<typeof createHelpers>;
