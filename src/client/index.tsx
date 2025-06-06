import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ModalContainer from "./components/Modal/ModalContainer";
import "react-tabs/style/react-tabs.css";
import App from "./App";
import "./localization";
import { initLocalization } from "./localization";

const createLinkinqClient = async ({
  modules,
  configurations: { pages, localizations },
}: {
  modules: any[];
  configurations: {
    pages: any;
    localizations: any;
  };
}) => {
  let modulesPages = {};
  let modulesLocalizations = {};
  modules.map((module) => {
    const moduleConf = module();
    modulesPages = { ...modulesPages, ...moduleConf.pages };
    modulesLocalizations = {
      ...modulesLocalizations,
      ...moduleConf.localizations,
    };
  });
  debugger;
  await initLocalization({
    localizations: { ...modulesLocalizations, ...localizations },
  });
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
      <App pages={{ ...modulesPages, ...pages }} />
      <ModalContainer />
    </>
  );
};

export { createLinkinqClient, App, ModalContainer };
