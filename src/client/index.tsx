import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./loc/index"; // Načtení konfigurace i18n
import ModalContainer from "./components/Modal/ModalContainer";
import "react-tabs/style/react-tabs.css";

const createLinkinqClient = () => {
  console.log("XXXX");
  debugger;
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <ModalContainer />
    </>
  );
};

export { createLinkinqClient, App, ModalContainer };
