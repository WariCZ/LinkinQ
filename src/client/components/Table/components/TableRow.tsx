import { Checkbox } from "flowbite-react";
import { flexRender, Row } from "@tanstack/react-table";
import { RowMenu } from "./RowMenu";
import { Dispatch, SetStateAction } from "react";
import React from "react";
import {
  IconTasks,
  IconExport,
  IconPlus,
  IconPaperclip,
  IconShare,
  IconTrash,
  IconCopy,
  IconChevronRight,
} from "../../Icons";

interface TableRowProps<T> {
  row: Row<any>;
  i: number;
  rowClick?: (rowData: T) => void;
  selectedRows: string[];
  setSelectedRows: Dispatch<SetStateAction<string[]>>;
  highlightedRow?: string[];
  deleteRecord?: (guid: string) => Promise<void>;
  selectable?: boolean;
  rowMenuEnabled?: boolean;
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
  rowMenuEnabled = true,
}: TableRowProps<T>) => {
  const guid = row.original?.guid;
  const isSelected = selectedRows.includes(guid);
  const isHighlighted = highlightedRow?.includes(guid);

  return (
    <tr
      // onClick={() => rowClick && rowClick(row.original)}
      key={row.id + "-" + i}
      data-guid={guid}
      className={`hover:bg-gray-100 dark:hover:bg-gray-600 ${
        isHighlighted ? "highlight" : ""
      }`}
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
      {row?.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          // style={{ paddingLeft: `${row.depth * 20}px` }}
          className="px-2 py-2 whitespace-nowrap text-ellipsis overflow-hidden max-w-80 cursor-pointer"
          onClick={() => rowClick?.(row.original)}
        >
          {cell.column.id === "expander" && row.getCanExpand() ? (
            <button onClick={row.getToggleExpandedHandler()} className="mr-2">
              <IconChevronRight
                className={`transform transition-transform duration-300 ${
                  row.getIsExpanded() ? "rotate-90" : "rotate-0"
                }`}
              />
            </button>
          ) : null}
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
      {rowMenuEnabled ? (
        <td
          className="px-4 pt-2 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <RowMenu
            key={row.id + "-" + i}
            onColorSelect={(color) => console.log("color", color)}
            menuItems={[
              {
                label: "Duplikovat…",
                icon: <IconCopy />,
                onSelect: () => console.log("Duplikovat…"),
              },
              {
                label: "Úkoly",
                icon: <IconTasks />,
                subItems: [
                  {
                    label: "Nový úkol…",
                    icon: <IconPlus />,
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
                icon: <IconPaperclip />,
                onSelect: () => console.log("přílohy…"),
              },
              {
                label: "Sdílet…",
                icon: <IconShare />,
              },
              {
                label: "Exportovat…",
                icon: <IconExport />,
              },
              {
                label: "Odstranit",
                icon: <IconTrash />,
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
      ) : (
        <td></td>
      )}
    </tr>
  );
};
