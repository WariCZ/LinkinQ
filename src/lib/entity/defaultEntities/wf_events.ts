import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  wf_events: {
    system: true,
    withoutDefaultFields: true,
    fields: {
      id: {
        type: "bigint",
        isRequired: true,
        label: "Unique ID",
        description: "Unique Identifier for the record",
        system: true,
      },
      events: {
        type: "jsonb",
        label: "Events",
        description: "Events",
        system: true,
      },
    },
  },
};

export default entityFields;
