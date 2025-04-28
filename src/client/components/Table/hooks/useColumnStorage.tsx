import { useEffect, useState } from "react";
import { useTableConfigStore } from "../_store";
import { ColumnSizingState, OnChangeFn } from "@tanstack/react-table";
import { httpRequest } from "src/client/services/httpBase";

type ColumnConfig = {
  key: string;
  width?: number;
};

// export const useColumnStorage = (
//   tableKey: string,
//   defaultColumns: string[]
// ) => {
//   const { tableConfig, setTableConfig } = useTableConfigStore();
//   const [config, setConfig] = useState<ColumnConfig[]>([]);
//   const [tempSizing, setTempSizing] = useState<Record<string, number>>({});

//   useEffect(() => {
//     const local = localStorage.getItem(`tableConfig-${tableKey}`);
//     let loaded: ColumnConfig[] = [];

//     if (tableConfig[tableKey]) {
//       loaded = tableConfig[tableKey];
//     } else if (local) {
//       loaded = JSON.parse(local);
//     } else {
//       loaded = defaultColumns.map((key) => ({ key, width: 200 }));
//     }

//     setConfig(loaded);
//     setTempSizing(
//       Object.fromEntries(loaded.map((c) => [c.key, c.width ?? 200]))
//     );
//     setTableConfig(tableKey, loaded);
//   }, [tableKey]);

//   useEffect(() => {
//     if (config.length === 0) return;
//     localStorage.setItem(`tableConfig-${tableKey}`, JSON.stringify(config));
//     setTableConfig(tableKey, config);
//   }, [config]);

//   useEffect(() => {
//     const save = () => {
//       setConfig((prev) =>
//         prev.map((c) => ({
//           ...c,
//           width: tempSizing[c.key] ?? c.width,
//         }))
//       );
//     };

//     window.addEventListener("mouseup", save);
//     window.addEventListener("touchend", save);

//     return () => {
//       window.removeEventListener("mouseup", save);
//       window.removeEventListener("touchend", save);
//     };
//   }, [tempSizing]);

//   const selectedColumns = config.map((c) => c.key);

//   const handleColumnSizingChange: OnChangeFn<ColumnSizingState> = (updater) => {
//     const next = typeof updater === "function" ? updater(tempSizing) : updater;
//     setTempSizing(next);
//   };

//   const setColumns = (keys: string[]) => {
//     setConfig(
//       keys.map((k) => {
//         const existing = config.find((c) => c.key === k);
//         return existing || { key: k, width: 200 };
//       })
//     );
//   };

//   return {
//     selectedColumns,
//     columnSizing: tempSizing,
//     setSelectedColumns: setColumns,
//     handleColumnSizingChange,
//   };
// };


export const useColumnStorage = (
  tableKey: string,
  defaultColumns: string[],
  userId?: string
) => {
  const { tableConfig, setTableConfig } = useTableConfigStore();
  const [config, setConfig] = useState<ColumnConfig[]>([]);
  const [tempSizing, setTempSizing] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await httpRequest({
          method: "GET",
          url: `/api/userConfiguration`,
          params: {
            key: tableKey,
          },
        });

        const loaded: ColumnConfig[] =
          response.data?.config ?? defaultColumns.map((key) => ({ key, width: 200 }));

        setConfig(loaded);
        setTempSizing(Object.fromEntries(loaded.map((c) => [c.key, c.width ?? 200])));
        setTableConfig(tableKey, loaded);
      } catch (e) {
        console.error("Failed to load column config", e);
      }
    };

    fetchConfig();
  }, [tableKey]);

  useEffect(() => {
    if (config.length === 0) return;

    const saveConfig = async () => {
      try {
        await httpRequest({
          method: "POST",
          url: `/api/userConfiguration`,
          data: {
            key: tableKey,
            config,
            userId,
          },
        });
      } catch (e) {
        console.error("Failed to save column config", e);
      }
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