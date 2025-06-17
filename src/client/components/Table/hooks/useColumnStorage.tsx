import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import useStore from "../../../store";
import { useUserConfigurations } from "../../../hooks/useUserConfigurations";
import { useTableConfigStore } from "../_store";

type ColumnConfig = {
  key: string;
  width?: number;
};

export const useColumnStorage = (
  tableKey: string,
  defaultColumns: string[]
) => {
  const { userConfigurations } = useStore();
  const { saveUserConfiguration } = useUserConfigurations();
  const { setTableConfig } = useTableConfigStore();

  const configFromStore = userConfigurations[tableKey]?.definition?.config;

  const initial = useMemo<ColumnConfig[]>(() => {
    if (configFromStore && Array.isArray(configFromStore)) {
      return configFromStore;
    } else {
      return defaultColumns.map((key) => ({ key, width: 200 }));
    }
  }, [configFromStore, defaultColumns]);

  const [config, setConfig] = useState<ColumnConfig[]>(initial);
  const [initialConfig, setInitialConfig] = useState<ColumnConfig[]>(initial);
  const [tempSizing, setTempSizing] = useState<Record<string, number>>(
    Object.fromEntries(initial.map((c) => [c.key, c.width ?? 200]))
  );

  useEffect(() => {
    if (_.isEqual(config, initialConfig)) return;

    const save = async () => {
      await saveUserConfiguration(tableKey, { config });
      setInitialConfig(config);
    };

    save();
    setTableConfig(tableKey, config);
  }, [config]);

  useEffect(() => {
    const handle = () => {
      setConfig((prev) =>
        prev.map((c) => ({
          ...c,
          width: tempSizing[c.key] ?? c.width,
        }))
      );
    };

    window.addEventListener("mouseup", handle);
    window.addEventListener("touchend", handle);
    return () => {
      window.removeEventListener("mouseup", handle);
      window.removeEventListener("touchend", handle);
    };
  }, [tempSizing]);

  const selectedColumns = config.map((c) => c.key);

  const handleColumnSizingChange = (updater) => {
    const next = typeof updater === "function" ? updater(tempSizing) : updater;
    setTempSizing(next);
  };

  const setSelectedColumns = (keys: string[]) => {
    const updated = keys.map((k) => {
      const existing = config.find((c) => c.key === k);
      return existing || { key: k, width: 200 };
    });
    setConfig(updated);
  };

  return {
    selectedColumns,
    columnSizing: tempSizing,
    setSelectedColumns,
    handleColumnSizingChange,
  };
};
