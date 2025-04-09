import { create } from "zustand";

export type ColumnConfig = {
  key: string;
  width?: number;
};

interface TableConfigStore {
  tableConfig: Record<string, ColumnConfig[]>;
  setTableConfig: (tableKey: string, config: ColumnConfig[]) => void;
}

export const useTableConfigStore = create<TableConfigStore>((set) => ({
  tableConfig: {},
  setTableConfig: (tableKey, config) =>
    set((state) => ({
      tableConfig: {
        ...state.tableConfig,
        [tableKey]: config,
      },
    })),
}));
