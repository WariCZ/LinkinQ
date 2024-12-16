// i18n.js
import { Description } from "@bpmn-io/form-js";
import i18n from "i18next";
import { Settings } from "luxon";
import { initReactI18next } from "react-i18next";

// <p>{t("home.description")}</p>

i18n.use(initReactI18next).init({
  debug: true,
  missingKeyHandler: (lng, ns, key, fallbackValue) => {
    debugger;
    console.warn(
      `Missing translation for key: "${key}" in namespace: "${ns}" and language: "${lng}"`
    );
  },
  resources: {
    en: {
      translation: {
        add: "Add",
        header: {
          profile: "Profile",
          administration: "Administration",
          signout: "Sign out",
        },
        sidebar: {
          home: "Home",
          tasks: {
            parent: "Tasks",
            all: "All tasks",
            my: "My tasks",
            new: "New tasks",
            attn: "Tasks attn",
          },
        },
        "modal.close": "Close",
        "modal.save": "Save",
      },
    },
    cs: {
      translation: {
        nomove: "Koncový stav",
        add: "Přidat",
        header: {
          profile: "Profil",
          administration: "Administrace",
          signout: "Odhlásit",
        },
        sidebar: {
          home: "Domů",
          tasks: {
            parent: "Úkoly",
            all: "Všechny úkoly",
            my: "Moje úkoly",
            new: "Nové úkoly",
            attn: "Úkoly k pozornosti",
          },
        },
        "modal.close": "Zavřít",
        "modal.save": "Uložit",
      },
    },
    // es: {
    //   translation: {
    //     welcome: "Bienvenido a nuestro sitio web",
    //     description: "Este es un ejemplo de un sitio web multilingüe",
    //     changeLanguage: "Cambiar idioma",
    //   },
    // },
  },
  lng: localStorage.getItem("language") || "cs", // Výchozí jazyk
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React již text escapuje
  },
});

export default i18n;
