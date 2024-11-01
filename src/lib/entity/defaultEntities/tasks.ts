import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  tasks: {
    system: true,
    journal: true,
    fields: {
      description: {
        type: "text",
        label: "Description",
        description: "Description",
      },
    },
  },
};

export default { entityFields };
