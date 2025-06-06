import { useEffect, useState } from "react";
import { httpRequest, getSingleRecord } from "../../client/services/httpBase";
import _ from "lodash";
import { useDataCommon } from "./useDataCommon";

const DEFAULT_LIMIT = 50;

function useDataTable<T, U>(
  param: {
    entity: string;
    fields?: string[];
    filter?: Object;
    limit?: number;
    structure?: "topdown";
    groupby?: string[];
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
  const [groupby, setGroupby] = useState(param.groupby || []);
  const [highlightedRow, setHighlightedRow] = useState<string[]>([]);
  const [entity, setEntity] = useState(param.entity);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
    groupby,
    limit,
    structure,
    offset,
  }: {
    entity: string;
    fields?: string;
    filter?: Record<string, any>;
    ordering?: string;
    groupby?: string;
    limit?: number;
    structure?: "topdown";
    offset?: number;
  }) =>
    httpRequest({
      method: "GET",
      entity,
      params: {
        __fields: fields ?? "*",
        __orderby: ordering,
        __groupby: groupby,
        __limit: limit,
        __offset: offset,
        __structure: structure,
        ...filter,
      },
    });

  const fetchData = async ({
    entity,
    fields,
    filter,
    ordering,
    groupby,
    limit,
    structure,
    offset,
  }: {
    entity: string;
    fields?: string[];
    filter?: Object;
    limit?: number;
    structure?: "topdown";
    groupby?: string[];
    offset?: number;
    ordering?: {
      id: string;
      desc: boolean;
    }[];
  }): Promise<{ data: any[]; hasMore: boolean }> => {
    setError(null);
    try {
      const response = await getTableRecords({
        entity,
        fields: fields?.length ? fields.join(",") : "*",
        filter: filter || {},
        ordering: ordering?.map((o) => o.id + (o.desc ? "-" : "")).join(","),
        groupby: groupby.join(","),
        limit: limit || DEFAULT_LIMIT,
        structure: structure,
        offset: offset,
      });
      if (response) {
        if (offset && offset > 0) {
          setData((prev: any[]) => [...prev, ...response.data]);
        } else {
          setData(response.data);
        }
        return {
          data: response.data,
          hasMore: response.data.length >= (limit || DEFAULT_LIMIT),
        };
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    return { data: [], hasMore: false };
  };

  const refresh = async (params?: {
    fields?: string[];
    filter?: Object;
    entity?: string;
    limit?: number;
    structure?: "topdown";
    offset?: number;
    groupby?: string[];
    ordering?: {
      id: string;
      desc: boolean;
    }[];
  }) => {
    if (!ordering) setLoading(true);
    if (params?.fields) setFieldsEntity(params.fields);
    if (params?.filter) setFilter(params.filter);
    if (params?.ordering) setOrdering(params.ordering);
    if (params?.groupby) setGroupby(params.groupby);
    if (params?.entity) setEntity(params.entity);

    return await fetchData({
      entity: param.entity,
      fields: params?.fields || fieldsEntity,
      filter: params?.filter || filter,
      ordering: params?.ordering || ordering,
      groupby: params?.groupby || groupby,
      limit: params?.limit || param.limit,
      structure: params?.structure || param.structure,
      offset: params?.offset,
    });
  };

  const fetchNextPage = async () => {
    if (!hasMore || isFetchingNextPage) return;

    setIsFetchingNextPage(true);

    const offset = (data as any[]).length;
    const result = await fetchData({
      entity,
      fields: fieldsEntity,
      filter,
      ordering,
      groupby,
      limit: param.limit || DEFAULT_LIMIT,
      structure: param.structure,
      offset,
    });

    if (result && result.data.length < (param.limit || DEFAULT_LIMIT)) {
      setHasMore(false);
    }

    setIsFetchingNextPage(false);
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

  useEffect(() => {
    refresh();
  }, [fieldsEntity]);

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
      fetchNextPage,
      hasMore,
      setOrdering: (o: any) => refresh({ ordering: o }),
    },
  ] as const;
}

export default useDataTable;
