import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
// import { useGlobalState } from "./useSSE";
import _ from "lodash";
// import { MAIN_ID } from "../../lib/entity";
const MAIN_ID = "guid";
export const httpRequest = ({
  method,
  entity,
  data,
  config,
  params,
}: {
  method: string;
  entity: string;
  data?: Record<string, any>;
  config?: AxiosRequestConfig;
  params?: any;
}) => {
  const urpparams = new URLSearchParams();
  if (params) {
    Object.keys(params).map((p) => {
      if (params[p]) {
        if (Array.isArray(params[p])) {
          urpparams.append(p, JSON.stringify(params[p]));
        } else {
          urpparams.append(p, params[p]);
        }
      }
    });
  }
  return axios.request({
    method,
    url: "/api/entity/" + entity,
    data,
    params: urpparams,
    ...config,
  });
};

const getSingleRecord = ({
  entity,
  guid,
  fields,
}: {
  entity: string;
  guid: string;
  fields: string;
}) => {
  return httpRequest({
    method: "GET",
    entity: entity,
    params: {
      guid: guid,
      __fields: fields,
    },
  });
};

const getTableRecords = ({
  entity,
  fields,
  filter,
  ordering,
}: {
  entity: string;
  fields: string;
  filter: Object;
  ordering?: string;
}) => {
  return httpRequest({
    method: "GET",
    entity: entity,
    params: {
      __fields: fields,
      __orderby: ordering,
      ...filter,
    },
  });
};

export function idsValueInside(
  paramsFetch: Record<string, number[] | number>,
  params: Record<string, number[]>
): boolean {
  if (!paramsFetch) return true;
  if (!params) return true;

  const fetchIds = paramsFetch[MAIN_ID];
  const allIds = params[MAIN_ID];

  if (!fetchIds || !allIds) {
    return true;
  }

  const fetchIdsArr = Array.isArray(fetchIds) ? fetchIds : [fetchIds];

  const int = _.intersection(fetchIdsArr, allIds);
  return int.length === fetchIdsArr.length;
}

type EventData = any;
function useDataTable<T, U>(
  param: {
    entity: string;
    fields?: string[];
    filter?: Object;
    ordering?: {
      id: string;
      desc: boolean;
    }[];
  },
  initialState?: T
): [
  T,
  Dispatch<SetStateAction<T>>,
  {
    loading: boolean;
    error: string | null;
    setRecord: (data: U) => void;
    // createRecord: (data: U) => void;
    // deleteRecord: (guid: string) => void;
    refresh: (params?: { fields?: string[]; filter?: Object }) => void;
    fields: string[];
    filter: Object;
    highlightedRow: string[];
    ordering?: {
      id: string;
      desc: boolean;
    }[];
    setOrdering: Dispatch<
      SetStateAction<
        {
          id: string;
          desc?: boolean;
        }[]
      >
    >;
  }
] {
  const [data, setData] = useState(initialState as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldsEntity, setFieldsEntity] = useState(param.fields || []);
  const [filter, setFilter] = useState(param.filter || {});
  const [ordering, setOrdering] = useState(param.ordering || []);
  const [highlightedRow, setHighlightedRow] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const newEvent: EventData = JSON.parse(event.data);

      if (newEvent?.afterData?.guid)
        actualizeData({ guid: newEvent.afterData.guid });
    };

    eventSource.onerror = () => {
      console.error("Error occurred in EventSource");
      eventSource.close();
    };

    // Zavřít EventSource při odmountování komponenty
    return () => {
      eventSource.close();
    };
  }, []);

  const actualizeData = async ({ guid }: { guid: string }) => {
    const response = await getSingleRecord({
      entity: param.entity,
      guid: guid,
      fields: param.fields ? param.fields.join() : "guid",
    });
    setData((prevData) => {
      if (Array.isArray(prevData)) {
        setHighlightedRow(response.data.map((d: any) => d.guid));

        const prevDataGuids = _.keyBy(prevData, "guid");
        response.data.forEach((d: any) => {
          if (prevDataGuids[d.guid]) {
            _.merge(prevDataGuids[d.guid], d);
          } else {
            prevData.unshift(d);
            prevDataGuids[d.guid] = d;
          }
        });
        return [...prevData] as any;
      } else {
        return [...response.data];
      }
    });

    // Plynulé zmizení po 2 sekundách
    setTimeout(() => {
      setHighlightedRow([]);
    }, 700);
  };

  const setRecord = async (data: any) => {
    try {
      const guid = data.guid;
      delete data.guid;
      delete data.id;
      // Update
      if (guid) {
        const response = await httpRequest({
          entity: param.entity,
          method: "PUT",
          data: { where: { guid: guid }, data: data },
        });
      } else {
        const response = await httpRequest({
          entity: param.entity,
          method: "POST",
          data: data,
        });
      }
      // const response = await methods.create(data);
      //   setData(response.data as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async ({
    entity,
    fields,
    filter,
    ordering,
  }: {
    entity: string;
    fields?: string[];
    filter?: Object;
    ordering?: {
      id: string;
      desc: boolean;
    }[];
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getTableRecords({
        entity,
        fields: fields && fields.length > 0 ? fields.join(",") : "*",
        filter: filter || {},
        ordering:
          ordering && ordering.map((o) => o.id + (o.desc ? "-" : "")).join(","),
      });
      console.log("response.data table", response.data, data);
      if (response) setData(response.data);
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("call useEffect");
    fetchData({
      entity: param.entity,
      fields: fieldsEntity || undefined,
      filter: filter || undefined,
      ordering: ordering || undefined,
    });
  }, [param.entity]);

  const refresh = async (params?: {
    fields?: string[];
    filter?: Object;
    ordering?: {
      id: string;
      desc: boolean;
    }[];
  }) => {
    await setLoading(true);
    if (params && params.fields) {
      await setFieldsEntity(params.fields);
    }
    if (params && params.filter) {
      await setFilter(params.filter);
    }
    if (params && params.ordering) {
      await setOrdering(params.ordering);
    }
    await fetchData({
      entity: param.entity,
      fields: params?.fields || fieldsEntity || undefined,
      filter: params?.filter || filter || undefined,
      ordering: params?.ordering || ordering || undefined,
    });
  };

  // const createRecord = async (data: any) => {
  //   try {
  //     const response = await httpRequest({
  //       entity: param.entity,
  //       method: "POST",
  //       data: data,
  //     });
  //     // const response = await methods.create(data);
  //     //   setData(response.data as any);
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const deleteRecord = async (guid: string) => {
  //   try {
  //     const response = await httpRequest({
  //       entity: param.entity,
  //       method: "DELETE",
  //       data: { where: { guid: guid } },
  //     });
  //     // const response = await methods.create(data);
  //     setData(response.data);
  //     refresh();
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return [
    data,
    setData,
    {
      refresh,
      loading,
      error,
      fields: fieldsEntity,
      ordering,
      // createRecord,
      // deleteRecord,
      setRecord,
      filter,
      highlightedRow,
      setOrdering: (a: any) => {
        refresh({
          ordering: a,
        });
      },
    },
  ];
}

export default useDataTable;
