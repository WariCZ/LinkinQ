import { create } from "lodash";
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

const defaultData = ({ password }) => ({
  users: [
    {
      guid: "9500b584-fa8a-4a3c-8f94-92f2221db78b",
      caption: "admin",
      fullname: "admin",
      email: "admin@admin.cz",
      password: password, //process.env.DEFAULT_PASSWORD,
      createdby: 1,
      updatedby: 1,
      kind: 1,
    },
    {
      guid: "1500b584-fa8a-4a3c-8fa4-92f2221db78b",
      caption: "user",
      fullname: "user",
      email: "user@user.cz",
      password: password,
      createdby: 1,
      updatedby: 1,
      kind: 1,
    },
  ],
});
const updateData = {
  users: [
    {
      guid: "9500b584-fa8a-4a3c-8f94-92f2221db78b",
      roles: ["9500b584-fa8a-4a3c-8f91-92f2221db78b"],
    },
  ],
};

export default { entityFields, defaultData, updateData };
