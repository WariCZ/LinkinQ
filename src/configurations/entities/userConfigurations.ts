import { EntitySchema } from "../../lib/entity/types";

const entityFields: EntitySchema = {
  userConfigurations: {
    system: true,
    journal: true,
    workflow: true,
    fields: {
      definition: {
        type: "jsonb",
        label: "Definition",
        description: "Definition",
        system: true,
      },
      user: {
        type: "link(users)",
        label: "User",
        description: "User",
      },
    },
  },
};

export default entityFields;
