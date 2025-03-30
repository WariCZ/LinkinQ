import { useState } from "react";
import useStore from "../store";
import { updateOrCreateRecord, deleteByGuid } from "../services/httpBase";

export function useDataCommon<T>(initialState?: T) {
  const setToast = useStore((state) => state.setToast);
  const [data, setData] = useState<any>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setRecord = async (entity: string, newData: any) => {
    try {
      setLoading(true);
      await updateOrCreateRecord({ entity, data: newData });
    } catch (err: any) {
      setError(err.message);
      setToast({ type: "error", msg: err.response?.statusText || err.message });
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (
    entity: string,
    guid: string,
    onSuccess?: (data: any) => void
  ) => {
    try {
      setLoading(true);
      const response = await deleteByGuid({ entity, guid });
      onSuccess?.(response.data);
    } catch (err: any) {
      setError(err.message);
      setToast({ type: "error", msg: err.response?.statusText || err.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
    setRecord,
    deleteRecord,
  };
}
