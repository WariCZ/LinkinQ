import { EntitySchema } from "../../lib/entity/types";
const entityFields: EntitySchema = {
  wf_models: {
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
      name: {
        type: "text",
        label: "Name",
        description: "Name of the record",
        system: true,
      },
      source: {
        type: "text",
        label: "Source",
        description: "Source of the record",
        system: true,
      },
      svg: {
        type: "text",
        label: "SVG Data",
        description: "SVG representation data",
        system: true,
      },
      owner: {
        type: "text",
        label: "Owner",
        description: "Owner of the record",
        system: true,
      },
      saved: {
        type: "datetime",
        label: "Save Time",
        description: "Date and time when the record was saved",
        system: true,
      },
      processes: {
        type: "jsonb",
        label: "Processes",
        description: "JSON data for processes",
        system: true,
      },
      events: {
        type: "jsonb",
        label: "Events",
        description: "JSON data for events",
        system: true,
      },
      createdby: {
        type: "link(users)",
        isRequired: true,
        label: "Created by",
        description: "Record created by",
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
      guid: {
        type: "uuid",
        isRequired: true,
        label: "GUID",
        description: "GUID record",
        system: true,
      },
      ordering: {
        type: "integer",
        label: "Order",
        description: "Order record",
        system: true,
      },
      entity: {
        type: "text",
        label: "Entity",
        description: "Entity",
        system: true,
      },
      filter: {
        type: "jsonb",
        label: "Filter",
        description: "Filter for model",
        system: true,
      },
      default: {
        type: "boolean",
        label: "Default",
        description: "Default",
        system: true,
      },
    },
  },
};

export default entityFields;
