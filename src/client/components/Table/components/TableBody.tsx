import { Dispatch, SetStateAction } from "react";
import { TableRow } from "./TableRow";
import {
  Row,
  HeaderGroup,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

interface TableBodyProps<T> {
  rows: Row<any>[];
  loading: boolean;
  getHeaderGroups: () => HeaderGroup<any>[];
  rowClick?: (row: T) => void;
  selectedRows: string[];
  setSelectedRows: Dispatch<SetStateAction<string[]>>;
  highlightedRow?: string[];
  translatedColumns?: any[];
  deleteRecord?: (guid: string) => Promise<void>;
  hasMore?: boolean;
  selectable?: boolean;
  rowMenuEnabled?: boolean;
  isGroupBy?: boolean;
  isExpanded?: boolean;
  filteredData: any;
}

export const TableBody = <T,>({
  rows,
  loading,
  getHeaderGroups,
  rowClick,
  selectedRows,
  setSelectedRows,
  highlightedRow = [],
  translatedColumns,
  deleteRecord,
  hasMore,
  selectable,
  rowMenuEnabled,
  isGroupBy,
  filteredData,
}: TableBodyProps<T>) => {
  const { t: tComponents } = useTranslation("components");
  
  if (rows.length === 0 && !loading) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={translatedColumns.length + 2}
            className="text-center py-6 text-gray-400 italic"
          >
            {tComponents("labels.noData")}
          </td>
        </tr>
      </tbody>
    );
  }

  const renderRows = (rows: Row<any>[]) => {
    if (isGroupBy && Array.isArray(filteredData)) {
      return filteredData.flatMap((group: any, groupIndex: number) => {
        const rendered: JSX.Element[] = [];

        rendered.push(
          <tr
            key={`group-${group.key}-${groupIndex}`}
            className="bg-[#f3f4f6] text-sm text-gray-700 font-semibold uppercase border-t border-gray-300"
          >
            <td
              colSpan={translatedColumns.length + 2}
              className="px-4 py-2 tracking-wide"
            >
              <div className="flex items-center gap-2">{group.key}</div>
            </td>
          </tr>
        );

        const childTable = useReactTable({
          data: group.children,
          columns: translatedColumns,
          getCoreRowModel: getCoreRowModel(),
        });

        const childRows = childTable.getRowModel().rows;

        rendered.push(
          ...childRows.map((row: Row<any>, rowIndex: number) => (
            <TableRow
              key={row.id + "-" + rowIndex}
              row={row}
              i={rowIndex}
              rowClick={rowClick}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              highlightedRow={highlightedRow}
              deleteRecord={deleteRecord}
              selectable={selectable}
              rowMenuEnabled={rowMenuEnabled}
            />
          ))
        );

        return rendered;
      });
    }

    return rows.map((row, i) => (
      <TableRow
        key={row.id + "-" + i}
        row={row}
        i={i}
        rowClick={rowClick}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        highlightedRow={highlightedRow}
        deleteRecord={deleteRecord}
        selectable={selectable}
        rowMenuEnabled={rowMenuEnabled}
      />
    ));
  };
  return (
    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
      {loading
        ? getHeaderGroups().map((headerGroup: any) =>
            [0, 1, 2].map((_, i) => (
              <tr key={i} className="max-w-sm animate-pulse">
                {headerGroup.headers.map((_: any, a: number) => (
                  <td key={a} className="px-4 py-2 whitespace-nowrap">
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                  </td>
                ))}
              </tr>
            ))
          )
        : renderRows(rows)}

      {translatedColumns.length > 50 && (
        <tr>
          <td
            colSpan={translatedColumns.length + 2}
            className="text-center py-4 text-gray-400 italic"
          >
            {hasMore ? "Loading more..." : "No more data"}
          </td>
        </tr>
      )}
    </tbody>
  );
};
