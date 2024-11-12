import React, { Dispatch, SetStateAction } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

const Table = <T, U>({
  columns,
  data,
  highlightedRow,
  setOrdering,
  ordering,
  loading,
}: {
  loading?: boolean;
  columns: ColumnDef<T>[];
  data: T[];
  highlightedRow: string[];
  setOrdering?: Dispatch<
    SetStateAction<
      {
        id: string;
        desc: boolean;
      }[]
    >
  >;
  ordering?: SortingState;
}) => {
  // Use the useTable hook provided by react-table
  const { getRowModel, getHeaderGroups } = useReactTable({
    columns,
    data,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (o: any) => {
      setOrdering && setOrdering(o());
    },
    manualSorting: true,
    state: {
      sorting: ordering,
    },
  });

  // return (
  //   <div role="status" className="max-w-sm animate-pulse">
  //     <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
  //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
  //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
  //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
  //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
  //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
  //     <span className="sr-only">Loading...</span>
  //   </div>
  // );
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="bg-[#2c3a54] text-xs text-gray-50 uppercase dark:bg-gray-700 dark:text-gray-400">
          {getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    className="px-6 py-3"
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {loading
            ? getHeaderGroups().map((headerGroup) =>
                ["", "", ""].map(() => (
                  <tr key={headerGroup.id} className="max-w-sm animate-pulse">
                    {headerGroup.headers.map((header) => {
                      return (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )
            : getRowModel().rows.map((row) => {
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-100 dark:hover:bg-gray-600 ${
                      highlightedRow.indexOf((row.original as any).guid) > -1
                        ? "highlight"
                        : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
