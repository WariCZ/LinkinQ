/* @vite-ignore */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const pageflow = {
  tasks: {
    list: [],
    detail: [],
  },
};
const componentCache = {};

const Pageflow = () => {
  const { entity } = useParams();
  const [DynamicComponent, setDynamicComponent] = useState(null);

  useEffect(() => {
    console.log("XXXX");
    const loadComponent = async () => {
      if (componentCache[entity]) {
        console.log(`Using cached component for: ${entity}`);
        setDynamicComponent(() => componentCache[entity]);
      }

      try {
        const config = await axios.request({
          method: "GET",
          url: "/pageflow/config",
        });
        if (config.data[entity]) {
          //debugger;
          const file = config.data[entity].list.file;
          console.log("AAAA");

          const components = (import.meta as any).glob("./pageflow/**/*.tsx");

          const DynamicComponent = React.lazy(async () => {
            const x = await components[`./pageflow/${file}.tsx`]();
            return x;
          });
          // const module = await import(`./pageflow/${file}`);

          // componentCache[entity] = module.default;
          setDynamicComponent(DynamicComponent);
        } else {
          setDynamicComponent(() => () => <div>not found pageflow</div>);
        }
      } catch (error) {
        console.error(error);
        console.error("Failed to get component for: " + entity);
        setDynamicComponent(() => () => <div>not found pageflow file</div>);
      }
    };

    loadComponent();
  }, []); // Spustí se pouze jednou po načtení aplikace

  return (
    <>{DynamicComponent ? <DynamicComponent /> : <p>Loading component...</p>}</>
  );
};
export default Pageflow;
