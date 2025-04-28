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
      caption: "User settings",
      value: 1,
      lov: "userConfigurationsKind",
    },
    {
      guid: uuid(),
      caption: "Tabulka",
      value: 2,
      lov: "userConfigurationsKind",
    },
    {
      guid: uuid(),
      caption: "Settings",
      value: 1,
      lov: "appConfigurationsKind",
    },
    {
      guid: uuid(),
      caption: "Forms",
      value: 2,
      lov: "appConfigurationsKind",
    },
  ],
});

export default defaultData;
