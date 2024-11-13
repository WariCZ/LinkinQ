import React from "react";
import useStore from "../store";
import { Button } from "flowbite-react";
import useDataApi from "../hooks/useDataApi";

import { useTranslation } from "react-i18next";
import Protected from "./Protected";

const ProtectedPage: React.FC = () => {
  const user = useStore((state) => state.user);
  const { t, i18n } = useTranslation();

  console.log("call ProtectedPage");
  const [
    data,
    setData,
    {
      loading: loadingData,
      refresh,
      fields,
      deleteRecord,
      filter,
      createRecord,
      highlightedRow,
    },
  ] = useDataApi(
    {
      entity: "users",
      fields: ["fullname", "guid"],
      // fields: fieldsInput.split(","),
      // filter: filterInput,
      // filter: {
      //   "createdby.fullname": "admin",
      //   guid: "3ba3734d-c49d-4a33-9405-c9bbb587fac1",
      // },
    },
    [] as { fullname: string; guid: string }[]
  );

  // Funkce pro změnu jazyka
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  if (loadingData) return "Loading";

  return (
    <div>
      <Protected requiredRoles={["prodigi.admin"]}>TEST</Protected>
      <div>X</div>
      <h1>{t("welcome")}</h1>
      <p>{t("description")}</p>
      <div>{JSON.stringify(user)}</div>
      <div>
        <button onClick={() => changeLanguage("en")}>English</button>
        <button onClick={() => changeLanguage("cs")}>Čeština</button>
        <button onClick={() => changeLanguage("es")}>Español</button>
      </div>
      <Button color="primary">test</Button>
      <h1>Protected Page</h1>
      <Button onClick={() => refresh()}>reload</Button>
      <Button
        onClick={() => createRecord({ caption: "test", fullname: "test2" })}
      >
        Add
      </Button>
      {data?.map((d, i) => (
        <p
          key={i}
          className={highlightedRow.indexOf(d.guid) > -1 ? "highlight" : ""}
        >
          Welcome, {d?.fullname}! {d?.guid}
          <span onClick={() => deleteRecord(d.guid)}>Smazat</span>
        </p>
      ))}
    </div>
  );
};

export default ProtectedPage;
