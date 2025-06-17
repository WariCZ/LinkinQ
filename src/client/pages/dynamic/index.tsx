import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const DynamicComponent = (/*{ name }: { name: string } */) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const { t } = useTranslation();
  const name = "xxx";
  useEffect(() => {
    import(/* @vite-ignore */ `/pageflow/dynamic/${name}.js`)
      .then((mod) => setComponent(() => mod.default))
      .catch((err) => {
        console.error("Failed to load dynamic component:", err);
      });
  }, [name]);

  if (!Component)
    return (
      <div>
        {t("status.loadingComponent")} {name}...
      </div>
    );
  return <Component />;
};

export default DynamicComponent;
