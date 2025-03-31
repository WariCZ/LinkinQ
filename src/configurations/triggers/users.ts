import { TriggerItemType } from "../../lib/entity/triggers";

const triggers: TriggerItemType[] = [
  {
    guid: "1100b584-fa8a-4a3c-8f94-92f2221db78b",
    entity: "users",
    caption: "pridani Fullname",
    type: "before",
    active: true,
    method: "insert",
    code: function ({ data }) {
      data.caption = data.fullname;
    },
  },
  // {
  //   entity: "tasks",
  //   caption: "test sql tasks",
  //   type: "before",
  //   method: "insert",
  //   code: async function ({ data, sql }) {
  //     const x = await sql.select({
  //       entity: "users",
  //       fields: ["fullname"],
  //     });
  //     console.log("test", x);
  //   },
  // },
];

export default triggers;
