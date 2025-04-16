import { EntitySchema } from "../../lib/entity/types";
const entityFields: EntitySchema = {
  triggers: {
    system: true,
    journal: true,
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
      type: {
        type: "text",
        label: "Type",
        description: "Type (before, after)",
        isRequired: true,
      },
      method: {
        type: "text",
        label: "Method",
        description: "Type (insert, update, delete)",
        isRequired: true,
      },
      code: {
        type: `text`,
        label: "Code",
        description: "Code",
      },
    },
  },
};

export default entityFields;
