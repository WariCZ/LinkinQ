import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  lov: {
    system: true,
    fields: {
      value: {
        type: "integer",
        label: "Value",
        description: "Value",
        isRequired: false,
      },
    },
  },
};

const defaultData = {
  lov: [
    // Kind users
    {
      guid: "9500b884-fa8a-4a3c-8f94-92f2221db78a",
      caption: "Kind users",
      createdby: 1,
      updatedby: 1,
    },
    {
      guid: "9500b884-fa8a-4a3c-8f94-92f2221db78b",
      caption: "Users",
      createdby: 1,
      updatedby: 1,
      value: 1,
      parent: "9500b884-fa8a-4a3c-8f94-92f2221db78a",
    },
    {
      guid: "9500b884-fa8a-4a3c-8f94-92f2221db78c",
      caption: "Groups",
      createdby: 1,
      updatedby: 1,
      value: 2,
      parent: "9500b884-fa8a-4a3c-8f94-92f2221db78a",
    },
  ],
};

export default { entityFields, defaultData };
