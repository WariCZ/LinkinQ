import i18n from "i18next";
import _ from "lodash";
import { initReactI18next } from "react-i18next";

export const initLocalization = async ({ localizations }) => {
  // @ts-expect-error
  const modules = import.meta.glob("./i18n/**/*.json");

  const mergedResources = _.merge(
    {},
    await getNamespacedResources(modules),
    await getNamespacedResources(localizations || {})
  );

  i18n.use(initReactI18next).init({
    debug: true,
    lng: localStorage.getItem("language") || "cs",
    fallbackLng: "en",
    resources: mergedResources,
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    missingKeyHandler: (lng, ns, key) => {
      console.warn(
        `Missing translation for key: "${key}" in namespace: "${ns}" and language: "${lng}"`
      );
    },
  });

  return i18n;
};

export const getNamespacedResources = async (
  modules: Record<string, () => Promise<any>>
) => {
  const resources: Record<string, any> = {};

  for (const path in modules) {
    const json = await modules[path]();
    const cleanPath = path.replace(/(?:^|\/|.\/)i18n\/|\.json$/g, ""); // např. 'cs/common.json' → 'cs/common'

    const parts = cleanPath.split("/"); // např. ['cs', 'common'] nebo ['cs', 'dashboard', 'dashboard']

    if (parts.length < 2) {
      console.warn(`Skipping invalid path: ${path}`);
      continue;
    }

    const lang = parts[0];

    let namespace: string;

    if (parts.length === 2) {
      // i18n/cs/xyz.json → namespace 'common'
      namespace = "common";
    } else {
      // i18n/cs/dashboard/*.json → namespace = 'dashboard'
      namespace = parts[1];
    }

    resources[lang] ??= {};
    resources[lang][namespace] ??= {};

    const translationData = json.default ?? json;

    resources[lang][namespace] = _.merge(
      {},
      resources[lang][namespace],
      translationData
    );
  }

  return resources;
};

export default i18n;
