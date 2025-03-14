import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  attachments: {
    system: true,
    fields: {
      currentversion: {
        type: "link(attachments_history)",
        label: "Current version",
        description: "Current version",
        isRequired: true,
        system: true,
      },
      entity: {
        type: "text",
        label: "Entity",
        description: "Entity",
      },
      field: {
        type: "text",
        label: "Field",
        description: "Field",
      },
      entityid: {
        type: "text",
        label: "Entity ID",
        description: "Entity ID",
      },
    },
  },
};

export default { entityFields };
