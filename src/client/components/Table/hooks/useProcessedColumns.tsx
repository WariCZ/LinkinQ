import { useMemo } from "react";
import { useTranslatedColumns } from "./useTranslatedColumns";
import { TableFieldType } from "../types";

type UseProcessedColumnsArgs = {
  columns: TableFieldType[];
  selectedColumns: string[];
  schema: any;
  entity: string;
  columnSizing: Record<string, number>;
  isExpanded: boolean;
};

export const useProcessedColumns = ({
  columns,
  selectedColumns,
  schema,
  entity,
  columnSizing,
  isExpanded,
}: UseProcessedColumnsArgs) => {
  const allKeys = useMemo(() => {
    return Array.from(
      new Set([
        ...columns.map((c) => (typeof c === "string" ? c : c.field)),
        ...selectedColumns,
      ])
    );
  }, [columns, selectedColumns]);

  const extendedColumns = useMemo(() => {
    return allKeys.map((key) => {
      const col = columns.find((c) =>
        typeof c === "string" ? c === key : c.field === key
      );
      return col ?? { field: key, header: key };
    });
  }, [allKeys, columns]);

  const filteredColumns = useMemo(() => {
    return selectedColumns
      .map((field) =>
        extendedColumns.find((c) =>
          typeof c === "string" ? c === field : c.field === field
        )
      )
      .filter(Boolean);
  }, [selectedColumns, extendedColumns]);

  const translatedColumns = useTranslatedColumns({
    columns: filteredColumns,
    schema,
    entity,
    columnSizing,
    isExpanded,
  });

  return { translatedColumns };
};
