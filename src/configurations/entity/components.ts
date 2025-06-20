import { EntitySchema } from "../../lib/entity/types";
const entityFields: EntitySchema = {
  components: {
    system: true,
    journal: true,
    fields: {
      attn: {
        type: "link(users)",
        label: "Reviewing",
        description: "Currently reviewing users",
        system: true,
      },
    },
  },
};

export default entityFields;
