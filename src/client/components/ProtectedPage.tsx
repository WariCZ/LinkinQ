import React from "react";
import useStore from "../store";
import { Button } from "flowbite-react";

import { useTranslation } from "react-i18next";
import Protected from "./Protected";

const ProtectedPage: React.FC = () => {
  const user = useStore((state) => state.user);
  const { t, i18n } = useTranslation();

  console.log("call ProtectedPage");

  // Funkce pro změnu jazyka
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

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
    </div>
  );
};

export default ProtectedPage;
