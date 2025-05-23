import React, { useEffect, useState } from "react";

export function DynamicComponent(/*{ name }: { name: string } */) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  const name = "xxxs";
  useEffect(() => {
    import(/* @vite-ignore */ `/dynamic/${name}.js`)
      .then((mod) => setComponent(() => mod.default))
      .catch((err) => {
        console.error("Failed to load dynamic component:", err);
      });
  }, [name]);

  if (!Component) return <div>Načítám komponentu {name}...</div>;
  return <Component />;
}
