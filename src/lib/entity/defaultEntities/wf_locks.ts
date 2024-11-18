import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  wf_locks: {
    system: true,
    withoutDefaultFields: true,
    fields: {
      guid: {
        type: "uuid",
        isRequired: true,
        label: "GUID",
        description: "GUID record",
        system: true,
      },
      id: {
        type: "text",
        isRequired: true,
        label: "Unique ID",
        description: "Unique Identifier for the record",
        system: true,
      },
      server: {
        type: "text",
        label: "Server",
        description: "Server key",
        system: true,
      },
      time: {
        type: "datetime",
        label: "Time",
        description: "Locked at datetime",
        isRequired: true,
        system: true,
      },
      createtime: {
        type: "datetime",
        label: "Created",
        isRequired: true,
        description: "Created datetime",
        default: "now()",
        system: true,
      },
      createdby: {
        type: "link(users)",
        isRequired: true,
        label: "Created by",
        description: "Record created by",
        system: true,
      },
      updatedby: {
        type: "link(users)",
        isRequired: true,
        label: "Updated by",
        description: "Record updated by",
        system: true,
      },
      updatetime: {
        type: "datetime",
        isRequired: true,
        label: "Updated",
        description: "Updated datetime",
        system: true,
        default: "now()",
      },
    },
  },
};

export default entityFields;
