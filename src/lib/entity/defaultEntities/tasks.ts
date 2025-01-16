import { assign } from "lodash";
import { EntitySchema } from "../types";
import attachments from "./attachments";
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
            roles: ["linkinq.admin"],
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
      attachments: {
        type: "nlink(attachments)",
        label: "Attachments",
        description: "Attachments",
      },
    },
  },
};

export default { entityFields };
