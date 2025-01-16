import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  attachments: {
    system: true,
    fields: {
      currentversion: {
        type: "bigint",
        isRequired: true,
        label: "Current version",
        description: "Current version",
        default: 1,
        system: true,
      },
      roles: {
        type: `link(attachments_history)`,
        label: "Roles",
        description: "Roles",
      },
    },
  },
};

export default { entityFields };
