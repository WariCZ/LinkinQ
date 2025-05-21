import { Dispatch, SetStateAction } from "react";
import { TableRow } from "./TableRow";
import { Row, HeaderGroup } from "@tanstack/react-table";

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
  selectable?: boolean,
  rowMenuEnabled?: boolean
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
  rowMenuEnabled
}: TableBodyProps<T>) => {
  if (rows.length === 0 && !loading) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={translatedColumns.length + 2}
            className="text-center py-6 text-gray-400 italic"
          >
            No data to display
          </td>
        </tr>
      </tbody>
    );
  }

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
        : rows.map((row: any, i: number) => (
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
          ))}

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
