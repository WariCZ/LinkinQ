import { useNavigate } from "react-router-dom";
import useStore from "../store";
import { getSingleRecord } from "../services/httpBase";
import { lazy, useEffect, useState } from "react";
import _ from "lodash";
import { useModalStore } from "../components/Modal/modalStore";
import React, { startTransition, Suspense } from "react";

const isValidGuid = (guid) => {
  const guidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(guid);
};

const customComparator = (objValue, srcValue) => {
  return String(objValue) === String(srcValue);
};

const getLazyComponent = ({ pages, path }) => {
  const Component = lazy(async () => {
    const page = pages[path];
    if (!page) throw new Error(`Path "${path}" not found in glob.`);
    const module = await page();
    return { default: module.default };
  });
  return Component;
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
      return {
        Component: getLazyComponent({ pages, path: filtered[0].componentPath }),
        options: filtered[0],
      };
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
  onLoadDetail?: boolean;
  onLoadList?: boolean;
}) {
  const pageflow = useStore((state) => state.pageflow);
  const pages = useStore((state) => state.pages);
  const schema = useStore((state) => state.schema);
  const navigate = useNavigate();
  const [DynamicComponent, setDynamicComponent] = useState(null);
  const { openModal } = useModalStore();

  const getComponentDetail = async ({ entity, guid, type = "popup" }) => {
    if (!schema[entity]) {
      navigate("/");
      return;
    }

    if (guid && !isValidGuid(guid)) {
      navigate("/");
      return;
    }

    const pageflows = _.filter(pageflow, {
      entity: entity,
      ...(type ? { type } : {}),
    });
    const fields = _.uniq(
      _.flatten(
        pageflows.map((pf) => {
          return pf.filterFields;
        })
      )
    );
    try {
      if (pageflows.length === 1 && !pageflows[0].filter) {
        const Component = getLazyComponent({
          pages,
          path: pageflows[0].componentPath,
        });
        if (Component) {
          setDynamicComponent(Component);
          return { Component, options: pageflows[0] };
        }
      } else {
        const { Component, options } = await fetchData({
          pages,
          pageflows,
          fields,
          entity,
          guid,
        });

        if (Component) {
          setDynamicComponent(Component);
          return { Component, options };
        }
      }
    } catch (err: any) {
      // setError(err.message);
      console.error(err.response?.statusText || err.message || err);
      navigate("/");
      return;
    }
  };

  const getComponentList = ({ entity }) => {
    const pageflows = _.filter(pageflow, {
      entity: entity,
      type: "list",
    });

    if (pageflows.length === 0) {
      navigate("/");
      return;
    }

    const Component = getLazyComponent({
      pages,
      path: pageflows[0].componentPath,
    });

    if (Component) {
      setDynamicComponent(Component);
      return Component;
    }
  };

  const openDetail = async ({
    entity,
    guid,
    type,
  }: {
    entity?: string;
    guid: string;
    type?: "detail" | "popup";
  }) => {
    const { Component, options }: any = await getComponentDetail({
      entity: entity || props?.entity,
      guid: guid,
      type: type,
    });
    debugger;
    if (Component) {
      if (type === "detail") {
        if (options.path.indexOf(":guid") > -1) {
          navigate(options.path.replace(":guid", guid));
        } else {
          navigate(`/${options.entity}/${guid}`);
        }
      } else {
        openModal(
          <Suspense>
            <Component guid={guid} />
          </Suspense>,
          {
            size: "4xl",
          }
        );
      }
    }
  };

  useEffect(() => {
    if (props?.onLoadDetail && props.entity && props.guid) {
      getComponentDetail({ entity: props.entity, guid: props.guid });
    }
    if (props?.onLoadList && props.entity && !props.guid) {
      getComponentList({ entity: props.entity });
    }
  }, [props?.entity, navigate, props?.onLoadList, props?.onLoadDetail]);

  return {
    Component: DynamicComponent,
    getComponentDetail: getComponentDetail,
    openDetail: openDetail,
  };
}
