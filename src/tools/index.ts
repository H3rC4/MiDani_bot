import { get_current_time } from './time.js';

export const tools: Record<string, any> = {
  [get_current_time.name]: get_current_time
};

export const toolDefinitions = Object.values(tools).map(t => ({
  type: "function",
  function: {
    name: t.name,
    description: t.description,
    parameters: t.schema
  }
}));
