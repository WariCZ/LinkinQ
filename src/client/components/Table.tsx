import React from "react";
import { Column, useTable } from "react-table";

const Table = ({
  columns,
  data,
  highlightedRow,
}: {
  columns: Column<Object>[];
  data: Record<string, any>[];
  highlightedRow: string[];
}) => {
  // Use the useTable hook provided by react-table
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <div className="overflow-x-auto">
      <table
        className="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400"
        {...getTableProps()}
      >
        <thead className="bg-[#2c3a54] text-xs text-gray-50 uppercase dark:bg-gray-700 dark:text-gray-400">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th className="px-6 py-3" {...column.getHeaderProps()}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700"
          {...getTableBodyProps()}
        >
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className={`hover:bg-gray-100 dark:hover:bg-gray-600 ${
                  highlightedRow.indexOf(row.original.guid) > -1
                    ? "highlight"
                    : ""
                }`}
              >
                {row.cells.map((cell) => (
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    {...cell.getCellProps()}
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
