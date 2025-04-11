import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import _ from "lodash";
import useStore from "@/client/store";
import { TableFieldType, TableOrdering } from "./types";
import { useColumnStorage } from "./hooks/useColumnStorage";
import { useTranslatedColumns } from "./hooks/useTranslatedColumns";
import { TableToolbar } from "./components/TableToolbar";
import { DateTime } from "luxon";
import { TableHeader } from "./components/TableHeader";
import { TableBody } from "./components/TableBody";

interface TableProps<T> {
  tableConfigKey: string;
  selectable?: boolean;
  entity?: string;
  loading?: boolean;
  columns: TableFieldType[];
  data: T[];
  rowClick?: (data: T) => void;
  highlightedRow?: string[];
  setOrdering?: Dispatch<SetStateAction<TableOrdering[]>>;
  ordering?: TableOrdering[];
  deleteRecord?: (guid: string) => Promise<void>;
  fetchNextPage?: () => Promise<void>;
  hasMore?: boolean;
  multiUpdate?: (guids: string[], data: Partial<any>) => Promise<void>;
}

const Table = <T, _>({
  tableConfigKey,
  columns,
  data,
  highlightedRow,
  setOrdering,
  ordering,
  loading,
  rowClick,
  entity,
  deleteRecord,
  fetchNextPage,
  hasMore,
  multiUpdate,
  selectable,
}: TableProps<T>) => {
  const schema = useStore((state) => state.schema);
  const columnSelectorRef = useRef<any>(null);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [fullTextSearch, setFullTextSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const {
    selectedColumns,
    columnSizing,
    setSelectedColumns,
    handleColumnSizingChange,
  } = useColumnStorage(
    tableConfigKey,
    columns.map((c) => (typeof c === "string" ? c : c.field))
  );

  const filteredColumns = selectedColumns
    .map((field) =>
      columns.find((c) =>
        typeof c === "string" ? c === field : c.field === field
      )
    )
    .filter(Boolean);

  const translatedColumns = useTranslatedColumns({
    columns: filteredColumns,
    schema,
    entity,
    columnSizing,
  });

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      ?.filter((item) => {
        if (!fullTextSearch) return true;

        return Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(fullTextSearch.toLowerCase())
        );
      })
      ?.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === "") return true;

          const itemValue = _.get(item, key);

          if (typeof value === "object" && value !== null) {
            const { from, to } = value;
            if (!itemValue) return false;

            const itemDate = DateTime.fromISO(itemValue).startOf("day");
            if (!itemDate.isValid) return false;

            if (from) {
              const fromDate = DateTime.fromFormat(from, "yyyy-MM-dd").startOf(
                "day"
              );
              if (!fromDate.isValid || itemDate < fromDate) return false;
            }

            if (to) {
              const toDate = DateTime.fromFormat(to, "yyyy-MM-dd").endOf("day");
              if (!toDate.isValid || itemDate > toDate) return false;
            }

            return true;
          }

          if (typeof value === "boolean") {
            return itemValue === value;
          }

          if (typeof value === "string") {
            return itemValue
              ?.toString()
              .toLowerCase()
              .includes(value.toLowerCase());
          }

          if (typeof value === "number") {
            return itemValue === value;
          }

          return true;
        });
      });
  }, [data, filters, fullTextSearch]);

  const { getRowModel, getHeaderGroups } = useReactTable({
    columns: translatedColumns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (o: any) => {
      setOrdering && setOrdering(o());
    },
    manualSorting: true,
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    state: {
      sorting: ordering?.map((o) => ({ ...o, desc: o.desc || false })),
      columnSizing: columnSizing,
    },
    columnResizeDirection: "rtl",
    onColumnSizingChange: handleColumnSizingChange,
  });

  const applyFilters = (dataFilter: Record<string, any>) => {
    setFilters(dataFilter);
  };

  const cleatFilters = () => {
    setFilters({});
    setFullTextSearch("");
  };

  const applyFullTextSeacrh = (textSearch: string) => {
    setFullTextSearch(textSearch);
  };

  const fetchMore = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement && hasMore && !loading) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        const bottomReached = scrollHeight - scrollTop - clientHeight < 500;

        if (bottomReached) {
          fetchNextPage && fetchNextPage();
        }
      }
    },
    [fetchNextPage, hasMore, loading, data.length]
  );

  return (
    <>
      <TableToolbar
        columns={translatedColumns}
        applyFilters={applyFilters}
        filters={filters}
        clearFilters={cleatFilters}
        applyFullTextSeacrh={applyFullTextSeacrh}
        fullTextSearch={fullTextSearch}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        deleteSelected={async () => {
          for (const guid of selectedRows) {
            await deleteRecord?.(guid);
          }
          setSelectedRows([]);
        }}
        multiUpdate={multiUpdate}
      />
      <div
        className="overflow-auto rounded-md"
        onScroll={(e) => fetchMore(e.currentTarget)}
        ref={tableContainerRef}
        style={{
          overflow: "auto",
          position: "relative",
          height: "72vh",
        }}
      >
        <table className="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
          <TableHeader
            getHeaderGroups={getHeaderGroups}
            getRowModel={getRowModel}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            filteredData={filteredData}
            columnSelectorRef={columnSelectorRef}
            selectedColumns={selectedColumns}
            columns={columns}
            schema={schema}
            entity={entity}
            selectable={selectable}
            setSelectedColumns={setSelectedColumns}
          />
          <TableBody
            rows={getRowModel().rows}
            loading={loading}
            getHeaderGroups={getHeaderGroups}
            rowClick={rowClick}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            highlightedRow={highlightedRow}
            translatedColumns={translatedColumns}
            deleteRecord={deleteRecord}
            hasMore={hasMore}
            selectable={selectable}
          />
        </table>
      </div>
    </>
  );
};

export default Table;
