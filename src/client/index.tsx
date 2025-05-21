import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./loc/index";
import ModalContainer from "./components/Modal/ModalContainer";
import "react-tabs/style/react-tabs.css";
import App from "./App";

const createLinkinqClient = () => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <ModalContainer />
    </>
  );
};

export { createLinkinqClient, App, ModalContainer };
