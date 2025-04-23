import { uuid } from "../../../src/server";

const defaultData = ({ env }) => ({
  lov: [
    {
      guid: uuid(),
      caption: "Uživatel",
      value: 1,
      lov: "usersKind",
    },
    {
      guid: uuid(),
      caption: "Tabulka",
      value: 1,
      lov: "userConfigurations",
    },
  ],
});

export default defaultData;
