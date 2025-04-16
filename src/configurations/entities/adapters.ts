import { EntitySchema } from "../../lib/entity/types";
const entityFields: EntitySchema = {
  adapters: {
    system: true,
    fields: {
      status: {
        type: "boolean",
        label: "Status",
        description: "Status",
      },
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
export default entityFields;
