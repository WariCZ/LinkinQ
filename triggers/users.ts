import { TriggerItemType } from "@/lib/entity/triggers";

const triggers: TriggerItemType[] = [
  {
    entity: "users",
    caption: "pridani Fullname",
    type: "before",
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
