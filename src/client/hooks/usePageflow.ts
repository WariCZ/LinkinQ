import { useNavigate } from "react-router-dom";
import useStore from "../store";
import { getSingleRecord } from "../services/httpBase";
import { lazy, useEffect, useState } from "react";
import _ from "lodash";
import { useModalStore } from "../components/Modal/modalStore";

const customComparator = (objValue, srcValue) => {
  return String(objValue) === String(srcValue);
};

const fetchData = async ({ pages, pageflows, fields, entity, guid }) => {
  const response = await getSingleRecord({
    entity,
    guid,
    fields: fields.join(","),
  });
  // setData(response.data[0]);
  if (response?.data[0]) {
    const filtered = _.filter(pageflows, (item) => {
      return _.isMatchWith(response.data[0], item.filter, customComparator);
    });

    if (filtered.length) {
      const Component = lazy(async () => {
        const page = pages[filtered[0].componentPath];
        if (!page)
          throw new Error(
            `Path "${filtered[0].componentPath}" not found in glob.`
          );
        const module = await page();
        return { default: module.default };
      });

      //   return setDynamicComponent(Component);
      return Component;
    } else {
      throw new Error("usePageflow not found pageflow");
    }
  } else {
    throw new Error("usePageflow not found data");
  }
};

export function usePageflow(props?: {
  entity?: string;
  guid?: string;
  onLoad?: boolean;
}) {
  const pageflow = useStore((state) => state.pageflow);
  const pages = useStore((state) => state.pages);
  const schema = useStore((state) => state.schema);
  const navigate = useNavigate();
  const [DynamicComponent, setDynamicComponent] = useState(null);
  const { openModal } = useModalStore();

  const getComponentDetail = async ({ entity, guid }) => {
    if (!schema[entity]) {
      navigate("/");
      return;
    }

    const pageflows = _.filter(pageflow, { entity: entity });
    const fields = _.uniq(
      _.flatten(
        pageflows.map((pf) => {
          return pf.filterFields;
        })
      )
    );
    try {
      if (pageflows.length === 1 && !pageflows[0].filter) {
        const Component = lazy(async () => {
          const page = pages[pageflows[0].componentPath];
          if (!page)
            throw new Error(
              `Path "${pageflows[0].componentPath}" not found in glob.`
            );
          const module = await page();
          return { default: module.default };
        });

        if (Component) {
          setDynamicComponent(Component);
          return Component;
        }
      } else {
        const Component = await fetchData({
          pages,
          pageflows,
          fields,
          entity,
          guid,
        });

        if (Component) {
          setDynamicComponent(Component);
          return Component;
        }
      }
    } catch (err: any) {
      // setError(err.message);
      console.error(err.response?.statusText || err.message || err);
      navigate("/");
      return;
    }
  };

  const openDetail = async ({ entity, guid }: any) => {
    const Component = await getComponentDetail({
      entity: entity || props?.entity,
      guid: guid,
    });
    if (Component) openModal(Component, { size: "4xl" });
  };

  useEffect(() => {
    if (props?.onLoad) {
      getComponentDetail({ entity: props.entity, guid: props.guid });
    }
  }, [props?.entity, navigate, props?.onLoad]);

  return {
    Component: DynamicComponent,
    getComponentDetail: getComponentDetail,
    openDetail: openDetail,
  };
}
