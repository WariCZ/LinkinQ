import { FormFieldType } from "../../../../client/types/DynamicForm/types";
import { AppColumnDef } from "../types";

export const useEditableTextFields = (
  columns: AppColumnDef<any, any>[]
): FormFieldType[] => {
  return columns
    .filter((col) => col.accessorKey === "caption")
    .map((col) => ({
      type: "text",
      field: col.accessorKey as string,
      label: `${col.header}: `,
      className: "grid grid-cols-[160px_1fr] items-center gap-2 my-0",
    }));
};
