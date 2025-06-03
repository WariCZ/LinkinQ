import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./loc/index";
import ModalContainer from "./components/Modal/ModalContainer";
import "react-tabs/style/react-tabs.css";
import App from "./App";

const createLinkinqClient = ({ pages }) => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
      <App pages={pages} />
      <ModalContainer />
    </>
  );
};

export { createLinkinqClient, App, ModalContainer };
