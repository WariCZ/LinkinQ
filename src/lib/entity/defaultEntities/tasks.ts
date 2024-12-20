import { assign } from "lodash";
import { EntitySchema } from "../types";
const entityFields: EntitySchema = {
  tasks: {
    system: true,
    journal: true,
    workflow: true,
    permissions: {
      get: {
        default: false,
        rules: [
          {
            type: "field",
            filter: {
              createdby: "$user",
            },
          },
          {
            type: "role",
            roles: ["prodigi.admin"],
            filter: {},
          },
        ],
      },
    },
    fields: {
      description: {
        type: "text",
        label: "Description",
        description: "Description",
      },
      attn: {
        type: "nlink(users)",
        label: "Attn",
        description: "Attn",
      },
      assignee: {
        type: "link(users)",
        label: "Assignee",
        description: "Assignee",
      },
    },
  },
};

export default { entityFields };
