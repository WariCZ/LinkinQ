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
  url,
}: {
  method: string;
  entity: string;
  data?: Record<string, any>;
  config?: AxiosRequestConfig;
  params?: any;
  url?: string;
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
    url: url || "/api/entity/" + entity,
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
function useDataDetail<T, U>(
  param: {
    entity: string;
    guid?: string;
    fields?: string[];
    filter?: Object;
    orderby?: string[];
  },
  initialState?: T
): [
  T,
  Dispatch<SetStateAction<T>>,
  {
    loading: boolean;
    error: string | null;
    setRecord: (data: U) => void;
    deleteRecord: (guid: string) => void;
    refresh: (params?: { fields?: string[]; filter?: Object }) => void;
    fields: string[];
  }
] {
  const [data, setData] = useState(initialState as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldsEntity, setFieldsEntity] = useState(param.fields || []);

  // useEffect(() => {
  //   const eventSource = new EventSource("/api/events");

  //   eventSource.onmessage = (event) => {
  //     const newEvent: EventData = JSON.parse(event.data);

  //     if (newEvent?.afterData?.guid)
  //       actualizeData({ guid: newEvent.afterData.guid });
  //   };

  //   eventSource.onerror = () => {
  //     console.error("Error occurred in EventSource");
  //     eventSource.close();
  //   };

  //   // Zavřít EventSource při odmountování komponenty
  //   return () => {
  //     eventSource.close();
  //   };
  // }, []);

  // const actualizeData = async ({ guid }: { guid: string }) => {
  //   const response = await getSingleRecord({
  //     entity: param.entity,
  //     guid: guid,
  //     fields: param.fields ? param.fields.join() : "guid",
  //   });

  //   setData((prevData) => {
  //     if (Array.isArray(prevData)) {
  //       return [...response.data, ...prevData] as any;
  //     } else {
  //       setData(response.data[0]);
  //     }
  //   });
  // };

  const fetchData = async ({
    entity,
    guid,
    fields,
  }: {
    entity: string;
    guid?: string;
    fields?: string[];
  }) => {
    setLoading(true);
    setError(null);

    try {
      if (guid) {
        const response = await getSingleRecord({
          entity,
          guid,
          fields: fields && fields.length > 0 ? fields.join(",") : "*",
        });
        console.log("response.data", response.data[0]);
        if (response) setData(response.data[0]);
      }
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
      guid: param.guid,
      fields: fieldsEntity || undefined,
    });
  }, [param.entity, param.guid]);

  const refresh = async (params?: { fields?: string[]; filter?: Object }) => {
    await setLoading(true);
    if (params && params.fields) {
      await setFieldsEntity(params.fields);
    }
    await fetchData({
      entity: param.entity,
      guid: param.guid,
      fields: params?.fields || fieldsEntity || undefined,
    });
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

  const deleteRecord = async (guid: string) => {
    try {
      const response = await httpRequest({
        entity: param.entity,
        method: "DELETE",
        data: { where: { guid: guid } },
      });
      // const response = await methods.create(data);
      setData(response.data);
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return [
    data,
    setData,
    {
      refresh,
      loading,
      error,
      fields: fieldsEntity,
      setRecord,
      deleteRecord,
    },
  ];
}

export default useDataDetail;
