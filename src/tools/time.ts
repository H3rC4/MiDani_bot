export const get_current_time = {
  name: "get_current_time",
  description: "Get the current date and time in ISO format.",
  schema: {
    type: "object",
    properties: {},
    required: []
  },
  execute: async (args: any) => {
    return new Date().toISOString();
  }
};
