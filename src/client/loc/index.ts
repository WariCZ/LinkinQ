// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "./resources";

i18n.use(initReactI18next).init({
  debug: true,
  lng: localStorage.getItem("language") || "cs",
  fallbackLng: "en",
  resources,
  interpolation: {
    escapeValue: false,
  },
  missingKeyHandler: (lng, ns, key) => {
    console.warn(
      `Missing translation for key: "${key}" in namespace: "${ns}" and language: "${lng}"`
    );
  },
});

export default i18n;
