import { TriggerItem } from "@/lib/entity/triggers";

const triggers = [
  {
    entity: "users",
    caption: "pridani Fullname",
    type: "before",
    method: "insert",
    code: function ({ data }: any) {
      data.caption = data.fullname;
    },
  },
];

export default triggers;
