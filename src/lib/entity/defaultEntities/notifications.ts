import { method } from "lodash";
import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  notifications: {
    system: true,
    fields: {
      active: {
        type: "boolean",
        label: "Active",
        description: "Active",
      },
      entity: {
        type: "text",
        label: "Entity",
        description: "Entity",
        isRequired: true,
      },
      method: {
        type: "text",
        label: "Method",
        description: "Type (insert, update, delete)",
        isRequired: true,
      },
      filter: {
        type: "jsonb",
        label: "Filter",
        description: "Filter",
        system: true,
      },
      adapters: {
        type: "nlink(adapters)",
        label: "Adapters",
        description: "Adapters",
        system: true,
      },
      subject: {
        type: "text",
        label: "Subject",
        description: "Subject",
      },
      text: {
        type: "text",
        label: "Text",
        description: "Text message",
      },
    },
  },
};

const defaultData = {
  notifications: [
    {
      caption: "Vytvoreni tasku",
      guid: "5500b584-fa8a-4a3c-8f91-92f2221db78b",
      entity: "tasks",
      method: "insert",
      active: true,
      subject: "Vytvoren task - ${{caption}}",
      text: "Byl vytvoren task s popisem:  ${{description}} od ${{createdby.fullname}}",
    },
  ],
};

export default { entityFields, defaultData };
