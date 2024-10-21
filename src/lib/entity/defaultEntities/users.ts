import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  users: {
    system: true,
    journal: true,
    fields: {
      fullname: {
        type: "text",
        label: "Fullname",
        isRequired: true,
        description: "Fullname",
      },
      password: {
        type: "password",
        label: "Password",
        description: "Password",
      },
      email: {
        type: "text",
        label: "Email",
        description: "Email",
      },
      roles: {
        type: `nlink(userroles)`,
        label: "Roles",
        description: "Roles",
      },
    },
  },
};

const defaultData = {
  users: [
    {
      guid: "9500b584-fa8a-4a3c-8f94-92f2221db78b",
      caption: "admin",
      fullname: "admin",
      email: "admin@admin.cz",
      password: "Vorvan5678x",
      createdby: 1,
      updatedby: 1,
      kind: 1,
      // roles: "9500b584-fa8a-4a3c-8f91-92f2221db78b",
    },
  ],
};

export default { entityFields, defaultData };
