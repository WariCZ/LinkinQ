import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  adapters: {
    system: true,
    fields: {
      active: {
        type: "boolean",
        label: "Active",
        description: "Active",
      },
      settings: {
        type: "jsonb",
        label: "Filter",
        description: "Filter",
        system: true,
      },
      type: {
        type: "text",
        label: "Type",
        description: "Type",
        isRequired: true,
      },
    },
  },
};

const defaultData = {
  adapters: [],
};

export default { entityFields, defaultData };
