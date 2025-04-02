import { useEffect, useState } from "react";
import { getSingleRecord, httpRequest } from "../services/httpBase";
import { useDataCommon } from "./useDataCommon";
import useStore from "../store";

function useDataDetail<T, U>(
  param: { entity: string; guid?: string; fields?: string[] },
  initialState?: T
) {
  const {
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
    setRecord,
    deleteRecord: baseDeleteRecord,
  } = useDataCommon<T>(initialState);

  const [fieldsEntity, setFieldsEntity] = useState(param.fields || []);
  const setToast = useStore((state) => state.setToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (param.guid) {
        const response = await getSingleRecord({
          entity: param.entity,
          guid: param.guid,
          fields: fieldsEntity.length ? fieldsEntity.join(",") : "*",
        });
        setData(response.data[0]);
      }
    } catch (err: any) {
      setError(err.message);
      setToast({ type: "error", msg: err.response?.statusText || err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [param.entity, param.guid]);

  const refresh = async (params?: { fields?: string[] }) => {
    if (params?.fields) setFieldsEntity(params.fields);
    await fetchData();
  };

  const deleteRecord = async (guid: string) => {
    await baseDeleteRecord(param.entity, guid, (res) => {
      setData(res);
      refresh();
    });
  };

  const saveRecord = (d: U) => setRecord(param.entity, d);

  const multiUpdate = async (guids: string[], data: Partial<U>) => {
    try {
      await httpRequest({
        method: "PUT",
        entity: param.entity,
        data: {
          data,
          where: { guid: guids },
        },
      });
      setToast({ type: "info", msg: "Records updated successfully" });
      refresh();
    } catch (err: any) {
      setToast({ type: "error", msg: err.response?.statusText || err.message });
    }
  };

  return [
    data,
    setData,
    {
      loading,
      error,
      fields: fieldsEntity,
      refresh,
      setRecord: saveRecord,
      deleteRecord,
      multiUpdate,
    },
  ];
}

export default useDataDetail;
