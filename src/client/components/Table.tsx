import React, { Dispatch, SetStateAction } from "react";
import {
  CellContext,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import useStore from "../store";
import { EntitySchema, EntityType } from "@/lib/entity/types";
import _ from "lodash";
import { DateTime } from "luxon";

export type TableFieldType =
  | {
      field: string;
      label?: string;
      className?: string;
      cell?: ({ getValue }: CellContext<any, unknown>) => string;
      size?: number;
      maxSize?: number;
    }
  | string;

const getLabel = ({
  field,
  schema,
  entity,
}: {
  field: string;
  schema: EntitySchema;
  entity: string;
}) => {
  const ids = field.split(".");

  let label = [];
  ids.map((i) => {
    const f = schema[entity].fields[i];
    label.push(f.label);
    entity = f.link;
  });
  return label.join("/");
};

const translateColumns = ({
  columns,
  schema,
  entity,
}: {
  columns: TableFieldType[];
  schema?: EntitySchema;
  entity?: string;
}): ColumnDef<any>[] => {
  return columns.map((c) => {
    let col;
    if (typeof c === "string") {
      const s = schema && schema[entity] && schema[entity].fields[c];
      if (c.indexOf(".") === -1) {
        if (s && s.type == "datetime") {
          col = {
            id: c,
            header: s?.label || c,
            accessorKey: c,
            cell: (info) => {
              const val = info.getValue();

              return DateTime.fromISO(val).toFormat("dd.MM.yyyy HH:mm:ss");
            },
          };
        } else {
          col = {
            id: c,
            header: s?.label || c,
            accessorKey: c,
          };
        }
      } else {
        const ids = c.split(".");
        const label = getLabel({ entity, field: s?.label || c, schema });
        col = {
          id: ids[0],
          header: label,
          accessorKey: ids[0],
          cell: (info) => {
            const val = info.getValue();
            if (Array.isArray(val)) {
              const id = ids.slice(1).join(".");
              return <span>{val.map((v) => _.get(v, id)).join(", ")}</span>;
            } else if (typeof val === "object") {
              const id = ids.slice(1).join(".");
              return <span>{_.get(val, id)}</span>;
            }
            return <span>{val}</span>;
          },
        };
      }
    } else {
      const s = schema && schema[entity] && schema[entity].fields[c.field];
      col = {
        id: c.field,
        header: c.label || s?.label || c.field,
        accessorKey: c.field,
        maxSize: c.maxSize,
        size: c.size,
        cell:
          c.cell ||
          ((info) => (
            <span className={c.className}>{info.getValue() as string}</span>
          )),
      };
    }
    return col;
  });
};
const Table = <T, U>({
  columns,
  data,
  highlightedRow,
  setOrdering,
  ordering,
  loading,
  rowClick,
  entity,
}: {
  entity?: string;
  loading?: boolean;
  columns: TableFieldType[];
  data: T[];
  rowClick?: (data: T) => void;
  highlightedRow?: string[];
  setOrdering?: Dispatch<
    SetStateAction<
      {
        id: string;
        desc?: boolean;
      }[]
    >
  >;
  ordering?: {
    id: string;
    desc?: boolean;
  }[];
}) => {
  const schema: any = useStore((state) => state.schema);
  const { getRowModel, getHeaderGroups } = useReactTable({
    columns: translateColumns({ columns, entity, schema }),
    data,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (o: any) => {
      setOrdering && setOrdering(o());
    },
    manualSorting: true,
    state: {
      sorting: ordering?.map((o) => ({ ...o, desc: o.desc || false })),
    },
    defaultColumn: {
      size: 200,
      minSize: 50,
      maxSize: 500,
    },
  });

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="bg-[#2c3a54] text-xs text-gray-50 uppercase dark:bg-gray-700 dark:text-gray-400">
          {getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    // style={{
                    //   width: `${header.column.getSize()}px`,
                    //   maxWidth: `${header.column.getSize()}px`,
                    // }}
                    className="px-4 py-2"
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
                ["", "", ""].map((k, i) => (
                  <tr key={i} className="max-w-sm animate-pulse">
                    {headerGroup.headers.map((header, a) => {
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
                    className={`hover:bg-gray-100 dark:hover:bg-gray-600 ${
                      highlightedRow &&
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
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
