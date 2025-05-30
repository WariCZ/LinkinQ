import { useEffect, useState } from "react";
import { useTableConfigStore } from "../_store";
import { ColumnSizingState, OnChangeFn } from "@tanstack/react-table";
import _ from "lodash";
import useStore from "../../../store";
import { useUserConfigurations } from "../../../hooks/useUserConfigurations";

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
  const [config, setConfig] = useState<ColumnConfig[]>([]);
  const [initialConfig, setInitialConfig] = useState<ColumnConfig[]>([]);
  const [tempSizing, setTempSizing] = useState<Record<string, number>>({});

  useEffect(() => {
    const loaded: ColumnConfig[] =
      configFromStore ?? defaultColumns.map((key) => ({ key, width: 200 }));

    setConfig(loaded);
    setInitialConfig(loaded);
    setTempSizing(
      Object.fromEntries(loaded.map((c) => [c.key, c.width ?? 200]))
    );
    setTableConfig(tableKey, loaded);
  }, [configFromStore, tableKey]);

  useEffect(() => {
    if (config.length === 0) return;
    if (_.isEqual(config, initialConfig)) return;

    const saveConfig = async () => {
      await saveUserConfiguration(tableKey, { config });
      setInitialConfig(config);
    };

    saveConfig();
    setTableConfig(tableKey, config);
  }, [config]);

  useEffect(() => {
    const save = () => {
      setConfig((prev) =>
        prev.map((c) => ({
          ...c,
          width: tempSizing[c.key] ?? c.width,
        }))
      );
    };

    window.addEventListener("mouseup", save);
    window.addEventListener("touchend", save);

    return () => {
      window.removeEventListener("mouseup", save);
      window.removeEventListener("touchend", save);
    };
  }, [tempSizing]);

  const selectedColumns = config.map((c) => c.key);

  const handleColumnSizingChange: OnChangeFn<ColumnSizingState> = (updater) => {
    const next = typeof updater === "function" ? updater(tempSizing) : updater;
    setTempSizing(next);
  };

  const setColumns = (keys: string[]) => {
    setConfig(
      keys.map((k) => {
        const existing = config.find((c) => c.key === k);
        return existing || { key: k, width: 200 };
      })
    );
  };

  return {
    selectedColumns,
    columnSizing: tempSizing,
    setSelectedColumns: setColumns,
    handleColumnSizingChange,
  };
};
