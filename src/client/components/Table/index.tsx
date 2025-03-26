import React, { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import _ from "lodash";
import useStore from "@/client/store";
import { TableFieldType, TableOrdering } from "./types";
import { useModalStore } from "../Modal/modalStore";
import { ColumnSelector } from "./components/ColumnSelector";
import { IoSettingsOutline } from "react-icons/io5";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import { useColumnStorage } from "./hooks/useColumnStorage";
import ColumnResizeHandle from "./components/ColumnResizeHandle";
import { useTranslatedColumns } from "./hooks/useTranslatedColumns";
import { TableToolbar } from "./components/TableToolbar";
import { DateTime } from "luxon";
interface TableProps<T> {
  tableConfigKey: string,
  entity?: string;
  loading?: boolean;
  columns: TableFieldType[];
  data: T[];
  rowClick?: (data: T) => void;
  highlightedRow?: string[];
  setOrdering?: Dispatch<SetStateAction<TableOrdering[]>>;
  ordering?: TableOrdering[];
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
}: TableProps<T>) => {
  const schema = useStore((state) => state.schema);
  const columnSelectorRef = useRef<any>(null);
  const { openModal, closeModal } = useModalStore();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [fullTextSearch, setFullTextSearch] = useState("")

  const {
    selectedColumns,
    columnSizing,
    setSelectedColumns,
    handleColumnSizingChange
  } = useColumnStorage(tableConfigKey, columns.map((c) => typeof c === "string" ? c : c.field));

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
    return data
      .filter((item) => {
        if (!fullTextSearch) return true;

        return Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(fullTextSearch.toLowerCase())
        );
      })
      .filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === "") return true;

          const itemValue = _.get(item, key);

          if (typeof value === "object" && value !== null) {
            const { from, to } = value;
            if (!itemValue) return false;

            const itemDate = DateTime.fromISO(itemValue).startOf("day");
            if (!itemDate.isValid) return false;

            if (from) {
              const fromDate = DateTime.fromFormat(from, "yyyy-MM-dd").startOf("day");
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
            return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
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
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    state: {
      sorting: ordering?.map((o) => ({ ...o, desc: o.desc || false })),
      columnSizing: columnSizing,
    },
    columnResizeDirection: 'rtl',
    onColumnSizingChange: handleColumnSizingChange,
  });


  const applyFilters = (dataFilter: Record<string, any>) => {
    setFilters(dataFilter)
  }

  const cleatFilters = () => {
    setFilters({})
    setFullTextSearch("")
  }

  const applyFullTextSeacrh = (textSearch: string) => {
    setFullTextSearch(textSearch)
  }

  return (
    <>
      <TableToolbar columns={translatedColumns} applyFilters={applyFilters} filters={filters} clearFilters={cleatFilters} applyFullTextSeacrh={applyFullTextSeacrh} fullTextSearch={fullTextSearch} />
      <div className="overflow-x-auto rounded-md">
        <table className="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="bg-[#2c3a54] text-xs text-gray-50 uppercase dark:bg-gray-700 dark:text-gray-400 ">
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      style={{ minWidth: `${header.getSize()}px` }}
                      className="relative group px-4 whitespace-nowrap border-r hover:bg-gray-700"
                      colSpan={header.colSpan}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {!header.isPlaceholder && (
                        <div
                          className={
                            header.column.getCanSort() ? "cursor-pointer select-none" : ""
                          }
                          title={
                            header.column.getCanSort()
                              ? header.column.getNextSortingOrder() === "asc"
                                ? "Sort ascending"
                                : header.column.getNextSortingOrder() === "desc"
                                  ? "Sort descending"
                                  : "Clear sort"
                              : undefined
                          }
                        >
                          <div className="flex gap-2 items-center">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" && <FaSortUp />}
                            {header.column.getIsSorted() === "desc" && <FaSortDown />}
                          </div>
                        </div>
                      )}

                      {header.column.getCanResize() && (
                        <ColumnResizeHandle
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                        />
                      )}
                    </th>
                  );
                })}
                <th key={headerGroup.id} className="w-14 hover:bg-gray-700">
                  <button onClick={() => {
                    openModal(
                      <ColumnSelector
                        ref={columnSelectorRef}
                        initialColumns={selectedColumns}
                        columns={columns}
                        schema={schema}
                        entity={entity}
                      />,
                      {
                        title: "Change columns visible",
                        size: "2xl",
                        modalSingle: true,
                        modalOnSuccess: () => {
                          const selected = columnSelectorRef.current?.getSelectedColumns();
                          if (selected) setSelectedColumns(selected);
                          closeModal();
                        },
                      }
                    );
                  }}
                    className="px-4 py-2">
                    <IoSettingsOutline size={20} />
                  </button>
                </th>
              </tr>
            ))}
          </thead>
          {getRowModel().rows.length ? (<tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {loading
              ? getHeaderGroups().map((headerGroup) =>
                ["", "", ""].map((_, i) => (
                  <tr key={i} className="max-w-sm animate-pulse">
                    {headerGroup.headers.map((_, a) => {
                      return (
                        <td key={a} className="px-4 py-2 whitespace-nowrap">
                          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )
              : getRowModel().rows.map((row, i) => {
                return (
                  <tr
                    onClick={() => {
                      rowClick && rowClick(row.original);
                    }}
                    key={row.id + "-" + i}
                    className={`hover:bg-gray-100 dark:hover:bg-gray-600 ${highlightedRow &&
                      highlightedRow.indexOf((row.original as any).guid) > -1
                      ? "highlight"
                      : ""
                      }`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          className="px-4 py-2 whitespace-nowrap text-ellipsis overflow-hidden max-w-80"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                    <td></td>
                  </tr>
                );
              })}
          </tbody>) : <div className="flex items-center justify-center w-full">no data</div>}
        </table>
      </div>
    </>
  );
};

export default Table;
