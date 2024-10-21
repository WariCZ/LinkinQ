import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  userroles: {
    system: true,
    fields: {
      key: {
        type: "text",
        label: "Key",
        isRequired: true,
        description: "Key",
      },
    },
  },
};

const defaultData = {
  userroles: [
    {
      guid: "9500b584-fa8a-4a3c-8f91-92f2221db78b",
      caption: "administrator",
      key: "prodigi.admin",
    },
  ],
};
export default { entityFields, defaultData };
