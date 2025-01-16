import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  attachments_history: {
    system: true,
    fields: {
      data: {
        type: "blob",
        isRequired: true,
        label: "Data",
        description: "Data",
        system: true,
      },
    },
  },
};

export default { entityFields };
