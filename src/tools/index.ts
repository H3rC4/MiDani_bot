import { get_current_time } from './time.js';
import * as google from './google.js';

export const tools: Record<string, any> = {
  [get_current_time.name]: get_current_time,
  [google.gmail_search.name]: google.gmail_search,
  [google.gmail_send.name]: google.gmail_send,
  [google.calendar_list.name]: google.calendar_list,
  [google.calendar_create.name]: google.calendar_create,
  [google.drive_search.name]: google.drive_search,
  [google.contacts_list.name]: google.contacts_list,
  [google.sheets_get.name]: google.sheets_get,
  [google.docs_cat.name]: google.docs_cat,
};

export const toolDefinitions = Object.values(tools).map(t => ({
  type: "function",
  function: {
    name: t.name,
    description: t.description,
    parameters: t.schema
  }
}));
