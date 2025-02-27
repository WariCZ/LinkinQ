import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./loc/index"; // Načtení konfigurace i18n
import ModalContainer from "./components/Modal/ModalContainer";
import 'react-tabs/style/react-tabs.css';

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <>
    <App />
    <ModalContainer />
  </>
  //</React.StrictMode>
);
