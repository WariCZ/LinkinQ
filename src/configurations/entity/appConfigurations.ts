import { EntitySchema } from "../../lib/entity/types";

const entityFields: EntitySchema = {
  appConfigurations: {
    system: true,
    journal: true,
    fields: {
      definition: {
        type: "jsonb",
        label: "Definition",
        description: "Definition",
        system: true,
      },
      key: {
        type: "text",
        label: "Key",
        description: "Key",
      },
      default: {
        type: "boolean",
        label: "Default",
        description: "Default",
      },
      active: {
        type: "boolean",
        label: "Active",
        description: "Active",
        default: true,
      },
    },
  },
};

export default entityFields;
