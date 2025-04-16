import { EntitySchema } from "../../lib/entity/types";
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

export default entityFields;
