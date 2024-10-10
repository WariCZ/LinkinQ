import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  wf_locks: {
    system: true,
    withoutDefaultFields: true,
    fields: {
      id: {
        type: "uuid",
        isRequired: true,
        label: "Unique ID",
        description: "Unique Identifier for the record",
        system: true,
      },
      server: {
        type: "text",
        label: "Server",
        description: "Server key",
        isRequired: true,
        system: true,
      },
      time: {
        type: "datetime",
        label: "Time",
        description: "Locked at datetime",
        isRequired: true,
        system: true,
      },
    },
  },
};

export default entityFields;
