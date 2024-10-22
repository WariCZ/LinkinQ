import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  triggers: {
    system: true,
    journal: true,
    fields: {
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
      code: {
        type: `text`,
        label: "Code",
        description: "Code",
        isRequired: true,
      },
    },
  },
};

const defaultData = {
  triggers: [],
};

export default { entityFields, defaultData };
