import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  journal: {
    system: true,
    fields: {
      entity: {
        type: "text",
        label: "Entity",
        isRequired: true,
        description: "Name of entity",
        system: true,
      },
      entityid: {
        type: "bigint",
        isRequired: true,
        label: "Entity ID",
        description: "Entity ID",
        system: true,
      },
      entityguid: {
        type: "text",
        isRequired: true,
        label: "Entity GUID",
        description: "Entity GUID",
        system: true,
      },
      operation: {
        type: "text",
        label: "Operation",
        description: "Operation of the record  (c, u, d)",
        system: true,
      },
      user: {
        type: "bigint",
        label: "User",
        description: "User",
        system: true,
      },
      fields_old: {
        type: "jsonb",
        label: "Fields old",
        description: "Fields old",
        system: true,
      },
      fields_new: {
        type: "jsonb",
        label: "Fields new",
        description: "Fields new",
        system: true,
      },
      fields_diff: {
        type: "jsonb",
        label: "Fields diff",
        description: "Fields diff",
        system: true,
      },
      fields_list: {
        type: "jsonb",
        label: "Fields list",
        description: "Fields list",
        system: true,
      },
    },
  },
};

export default entityFields;
