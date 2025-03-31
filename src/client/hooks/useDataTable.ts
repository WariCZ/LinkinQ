import { useEffect, useState } from "react";
import { httpRequest, getSingleRecord } from "@/client/services/httpBase";
import _ from "lodash";
import { useDataCommon } from "./useDataCommon";
import { off } from "process";

const DEFAULT_LIMIT = 50;

function useDataTable<T, U>(
  param: {
    entity: string;
    fields?: string[];
    filter?: Object;
    limit?: number;
    ordering?: {
      id: string;
      desc: boolean;
    }[];
  },
  initialState?: T
) {
  const {
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
    setRecord: baseSetRecord,
    deleteRecord: baseDeleteRecord,
  } = useDataCommon<T>(initialState);

  const [fieldsEntity, setFieldsEntity] = useState(param.fields || []);
  const [filter, setFilter] = useState(param.filter || {});
  const [ordering, setOrdering] = useState(param.ordering || []);
  const [highlightedRow, setHighlightedRow] = useState<string[]>([]);
  const [entity, setEntity] = useState(param.entity);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const newEvent = JSON.parse(event.data);
      if (newEvent?.afterData?.guid)
        actualizeData({ guid: newEvent.afterData.guid });
    };

    eventSource.onerror = () => {
      console.error("Error occurred in EventSource");
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const getTableRecords = ({
    entity,
    fields,
    filter,
    ordering,
    limit,
    offset,
  }: {
    entity: string;
    fields?: string;
    filter?: Record<string, any>;
    ordering?: string;
    limit?: number;
    offset?: number;
  }) =>
    httpRequest({
      method: "GET",
      entity,
      params: {
        __fields: fields ?? "*",
        __orderby: ordering,
        __limit: limit,
        __offset: offset,
        ...filter,
      },
    });

  const fetchData = async ({
    entity,
    fields,
    filter,
    ordering,
    limit,
    offset,
  }: {
    entity: string;
    fields?: string[];
    filter?: Object;
    limit?: number;
    offset?: number;
    ordering?: {
      id: string;
      desc: boolean;
    }[];
  }) => {
    setError(null);
    try {
      const response = await getTableRecords({
        entity,
        fields: fields?.length ? fields.join(",") : "*",
        filter: filter || {},
        ordering: ordering?.map((o) => o.id + (o.desc ? "-" : "")).join(","),
        limit: limit || DEFAULT_LIMIT,
        offset: offset,
      });
      if (response) setData(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async (params?: {
    fields?: string[];
    filter?: Object;
    entity?: string;
    limit?: number;
    offset?: number;
    ordering?: {
      id: string;
      desc: boolean;
    }[];
  }) => {
    if (!ordering) setLoading(true);
    if (params?.fields) setFieldsEntity(params.fields);
    if (params?.filter) setFilter(params.filter);
    if (params?.ordering) setOrdering(params.ordering);
    if (params?.entity) setEntity(params.entity);

    await fetchData({
      entity: param.entity,
      fields: params?.fields || fieldsEntity,
      filter: params?.filter || filter,
      ordering: params?.ordering || ordering,
      limit: params?.limit || param.limit,
      offset: params?.offset,
    });
  };

  const setRecord = (data: U) => baseSetRecord(param.entity, data);

  const deleteRecord = async (guid: string) => {
    await baseDeleteRecord(param.entity, guid, (res) => {
      setData(res);
      refresh();
    });
  };

  const actualizeData = async ({ guid }: { guid: string }) => {
    const response = await getSingleRecord({
      entity,
      guid,
      fields: param.fields?.join() ?? "*",
      filter: param.filter,
    });

    setData((prevData) => {
      if (Array.isArray(response.data) && response.data.length === 0) {
        return Array.isArray(prevData)
          ? prevData.filter((d) => d.guid !== guid)
          : prevData;
      }

      if (Array.isArray(prevData)) {
        const newGuids = response.data.map((d: any) => d.guid);
        setHighlightedRow(newGuids);

        const updated = [...prevData];
        response.data.forEach((d: any) => {
          const idx = _.findIndex(updated, { guid: d.guid });
          if (idx !== -1) updated[idx] = d;
          else updated.unshift(d);
        });

        return updated;
      }

      return [...response.data];
    });

    setTimeout(() => setHighlightedRow([]), 700);
  };

  return [
    data,
    setData,
    {
      loading,
      error,
      fields: fieldsEntity,
      filter,
      ordering,
      highlightedRow,
      refresh,
      setRecord,
      deleteRecord,
      setOrdering: (o: any) => refresh({ ordering: o }),
    },
  ] as const;
}

export default useDataTable;
