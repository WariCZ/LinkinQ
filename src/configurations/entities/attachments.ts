import { EntitySchema } from "../../lib/entity/types";
const entityFields: EntitySchema = {
  attachments: {
    system: true,
    fields: {
      currentversion: {
        type: "link(attachmentsHistory)",
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

export default entityFields;
