import { EntitySchema } from "../../lib/entity/types";
const entityFields: EntitySchema = {
  lov: {
    system: true,
    fields: {
      value: {
        type: "integer",
        label: "Value",
        description: "Value",
        isRequired: false,
      },
    },
  },
};

export default entityFields;
