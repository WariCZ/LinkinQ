// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: "Welcome to our website",
        description: "This is a multilingual website example",
        changeLanguage: "Change language",
        "modal.close": "Close",
        "modal.save": "Save",
      },
    },
    cs: {
      translation: {
        welcome: "Vítejte na naší stránce",
        description: "Toto je příklad vícejazyčného webu",
        changeLanguage: "Změnit jazyk",
        "modal.close": "Zavřít",
        "modal.save": "Uložit",
      },
    },
    es: {
      translation: {
        welcome: "Bienvenido a nuestro sitio web",
        description: "Este es un ejemplo de un sitio web multilingüe",
        changeLanguage: "Cambiar idioma",
      },
    },
  },
  lng: localStorage.getItem("language") || "cs", // Výchozí jazyk
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React již text escapuje
  },
});

export default i18n;
