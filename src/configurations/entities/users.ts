import { EntitySchema } from "../../lib/entity/types";
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

export default entityFields;
