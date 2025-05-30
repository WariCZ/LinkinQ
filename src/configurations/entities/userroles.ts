import { EntitySchema } from "../../lib/entity/types";
const entityFields: EntitySchema = {
  userroles: {
    system: true,
    fields: {
      key: {
        type: "text",
        label: "Key",
        isRequired: true,
        description: "Key",
      },
    },
  },
};

export default entityFields;
