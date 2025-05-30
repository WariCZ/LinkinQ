import { EntitySchema } from "../../lib/entity/types";
const entityFields: EntitySchema = {
  pageflow: {
    system: true,
    fields: {
      to: {
        type: "text",
        label: "To",
        description: "To",
        isRequired: false,
      },
      componentPath: {
        type: "text",
        label: "Component path",
        description: "Component path",
        isRequired: false,
      },
      isPublic: {
        type: "boolean",
        label: "Is public",
        description: "Is public",
        isRequired: false,
      },
    },
  },
};

export default entityFields;
