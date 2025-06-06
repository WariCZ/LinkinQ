import { lazy, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStore from "../../../store";
import _ from "lodash";
import { getSingleRecord } from "../../../services/httpBase";

const customComparator = (objValue, srcValue) => {
  return String(objValue) === String(srcValue);
};

const Page = () => {
  // debugger;
  const { entity, guid } = useParams();
  const navigate = useNavigate();
  const schema = useStore((state) => state.schema);
  const pageflowEntity = useStore((state) => state.pageflowEntity);
  const pages = useStore((state) => state.pages);
  const [DynamicComponent, setDynamicComponent] = useState(null);
  const setToast = useStore((state) => state.setToast);

  const fetchData = async (pageflows, fields) => {
    // setLoading(true);
    try {
      const response = await getSingleRecord({
        entity,
        guid,
        fields: fields.join(","),
      });
      // setData(response.data[0]);
      if (response?.data[0]) {
        const filtered = _.filter(pageflows, (item) =>
          _.isMatchWith(response.data[0], item.filter, customComparator)
        );
        const Component = lazy(async () => {
          const page = pages[filtered[0].componentPath + "index.tsx"];
          if (!page)
            throw new Error(
              `Path "${filtered[0].componentPath}" not found in glob.`
            );
          const module = await page();
          return { default: module.default };
        });

        setDynamicComponent(Component);
      } else {
        throw "Errror";
      }
    } catch (err: any) {
      // setError(err.message);
      setToast({ type: "error", msg: err.response?.statusText || err.message });
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (!schema[entity]) {
      // debugger;
      navigate("/", { replace: true });
      return;
    }

    const pageflows = _.filter(pageflowEntity, { entity: entity });
    const fields = _.uniq(
      _.flatten(
        pageflows.map((pf) => {
          return pf.filterFields;
        })
      )
    );
    fetchData(pageflows, fields);
  }, [entity, navigate]);

  // return (
  //   <div>
  //     <div>
  //       Detail Entita: {entity} guid: {guid}
  //     </div>
  //     <>{DynamicComponent ? <DynamicComponent /> : null}</>
  //   </div>
  // );
  return <>{DynamicComponent ? <DynamicComponent /> : null}</>;
};

export default Page;
