import { Checkbox } from "flowbite-react";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { flexRender, HeaderGroup, RowModel } from "@tanstack/react-table";
import ColumnResizeHandle from "./ColumnResizeHandle";
import { useModalStore } from "../../Modal/modalStore";
import { ColumnSelector } from "./ColumnSelector";
import { Dispatch, SetStateAction, RefObject } from "react";
import { TableFieldType } from "../types";

interface TableHeaderProps<T> {
  getHeaderGroups: () => HeaderGroup<T>[];
  getRowModel: () => RowModel<T>;
  selectedRows: string[];
  setSelectedRows: Dispatch<SetStateAction<string[]>>;
  filteredData: T[];
  columnSelectorRef: RefObject<any>;
  selectedColumns: string[];
  setSelectedColumns: Dispatch<SetStateAction<string[]>>;
  columns: TableFieldType[];
  schema: Record<string, any>;
  entity?: string;
}

export const TableHeader = <T,>({
  getHeaderGroups,
  getRowModel,
  selectedRows,
  setSelectedRows,
  filteredData,
  columnSelectorRef,
  selectedColumns,
  setSelectedColumns,
  columns,
  schema,
  entity,
}: TableHeaderProps<T>) => {
  const { openModal, closeModal } = useModalStore();
  return (
    <thead className="bg-[#2c3a54] text-xs text-gray-50 uppercase dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
      {getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {getRowModel().rows.length ? (
            <th className="px-4">
              <Checkbox
                checked={
                  selectedRows.length > 0 &&
                  selectedRows.length === filteredData.length
                }
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows(filteredData.map((row: any) => row.guid));
                  } else {
                    setSelectedRows([]);
                  }
                }}
                className="block cursor-pointer"
              />
            </th>
          ) : (
            <></>
          )}
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
                    <div className="flex gap-2 items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
            <button
              onClick={() => {
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
                      const selected =
                        columnSelectorRef.current?.getSelectedColumns();
                      if (selected) setSelectedColumns(selected);
                      closeModal();
                    },
                  }
                );
              }}
              className="px-4 py-2"
            >
              <IoSettingsOutline size={20} />
            </button>
          </th>
        </tr>
      ))}
    </thead>
  );
};
