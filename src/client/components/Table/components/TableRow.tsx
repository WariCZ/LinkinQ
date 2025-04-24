import { Checkbox } from "flowbite-react";
import { flexRender, Row } from "@tanstack/react-table";
import { RowMenu } from "./RowMenu";
import {
  FaCopy,
  FaTasks,
  FaPlus,
  FaPaperclip,
  FaShare,
  FaFileExport,
  FaTrash,
} from "react-icons/fa";
import { Dispatch, SetStateAction } from "react";
import React from "react";

interface TableRowProps<T> {
  row: Row<any>;
  i: number;
  rowClick?: (rowData: T) => void;
  selectedRows: string[];
  setSelectedRows: Dispatch<SetStateAction<string[]>>;
  highlightedRow?: string[];
  deleteRecord?: (guid: string) => Promise<void>;
  selectable?: boolean;
}

export const TableRow = <T,>({
  row,
  i,
  rowClick,
  selectedRows,
  setSelectedRows,
  highlightedRow = [],
  deleteRecord,
  selectable,
}: TableRowProps<T>) => {
  const guid = row.original.guid;
  const isSelected = selectedRows.includes(guid);
  const isHighlighted = highlightedRow?.includes(guid);

  return (
    <tr
      onClick={() => rowClick && rowClick(row.original)}
      key={row.id + "-" + i}
      className={`hover:bg-gray-100 dark:hover:bg-gray-600 ${isHighlighted ? "highlight" : ""}`}
    >
      {selectable ? (
        <td className="px-4">
          <Checkbox
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows((prev: string[]) => [...prev, guid]);
              } else {
                setSelectedRows((prev: string[]) =>
                  prev.filter((id) => id !== guid)
                );
              }
            }}
            className="block cursor-pointer"
          />
        </td>
      ) : (
        <></>
      )}
      {row.getVisibleCells().map((cell) => {
        return (
          <td
            key={cell.id}
            className="px-4 pt-2 whitespace-nowrap text-ellipsis overflow-hidden max-w-80 cursor-pointer"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
      <td className="px-4 pt-2 text-right" onClick={(e) => e.stopPropagation()}>
        <RowMenu
          key={row.id + "-" + i}
          onColorSelect={(color) => console.log("color", color)}
          menuItems={[
            {
              label: "Duplikovat…",
              icon: <FaCopy />,
              onSelect: () => console.log("Duplikovat…"),
            },
            {
              label: "Úkoly",
              icon: <FaTasks />,
              subItems: [
                {
                  label: "Nový úkol…",
                  icon: <FaPlus />,
                  onSelect: () => console.log("new"),
                },
                {
                  label: "Hromadné úkoly…",
                  onSelect: () => console.log("Hromadné"),
                },
                {
                  label: "Přiřazené úkoly…",
                  onSelect: () => console.log("Přiřazené"),
                },
              ],
            },
            {
              label: "Všechny přílohy…",
              icon: <FaPaperclip />,
              onSelect: () => console.log("přílohy…"),
            },
            {
              label: "Sdílet…",
              icon: <FaShare />,
            },
            {
              label: "Exportovat…",
              icon: <FaFileExport />,
            },
            {
              label: "Odstranit",
              icon: <FaTrash />,
              danger: true,
              onSelect: async () => {
                if (deleteRecord) {
                  await deleteRecord(guid);
                  setSelectedRows((prev) => prev.filter((id) => id !== guid));
                }
              },
            },
          ]}
        />
      </td>
    </tr>
  );
};
