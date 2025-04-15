import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./loc/index";
import ModalContainer from "./components/Modal/ModalContainer";
import "react-tabs/style/react-tabs.css";

const createLinkinqClient = () => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <ModalContainer />
    </>
  );
};

export { createLinkinqClient, App, ModalContainer };
