import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  wf_models: {
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
    },
  },
};

export default entityFields;
