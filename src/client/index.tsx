import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ModalContainer from "./components/Modal/ModalContainer";
import "react-tabs/style/react-tabs.css";
import App from "./App";
import "./localization";
import { initLocalization } from "./localization";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import useDataTable from "./hooks/useDataTable";
import { useModalStore } from "./components/Modal/modalStore";
import Table from "./components/Table";
import { useColumnStorage } from "./components/Table/hooks/useColumnStorage";
import useStore from "./store";
import DynamicForm from "./components/DynamicForm";
import useDataDetail from "./hooks/useDataDetail";
import { useParams, useNavigate } from "react-router-dom";

import { usePageflow } from "./hooks/usePageflow";

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

export {
  createLinkinqClient,
  App,
  ModalContainer,
  useTranslation,
  useDataTable,
  useLocation,
  useModalStore,
  useColumnStorage,
  Table,
  useStore,
  DynamicForm,
  useDataDetail,
  usePageflow,
  useParams,
  useNavigate,
};
