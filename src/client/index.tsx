import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ModalContainer from "./components/Modal/ModalContainer";
import "react-tabs/style/react-tabs.css";
import App from "./App";
import "./localization";
import { initLocalization } from "./localization";

const createLinkinqClient = async ({ pages, localizations }) => {
  await initLocalization({ localizations });
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
      <App pages={pages} />
      <ModalContainer />
    </>
  );
};

export { createLinkinqClient, App, ModalContainer };
