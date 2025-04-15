import { FormFieldType } from "../../../../client/types/DynamicForm/types";
import { AppColumnDef } from "../types";

export const useFilterFields = (
  columns: AppColumnDef<any, any>[]
): FormFieldType[] => {
  return columns
    .map((col): FormFieldType | FormFieldType[] => {
      const field = col.accessorKey as string;
      const type = col.meta?.type;
      const label = typeof col.header === "string" && col.header;

      switch (true) {
        case ["text", "uuid", "richtext", "jsonb", "password", "blob"].includes(
          type
        ):
          return {
            type: "text",
            field,
            label: `${label}: `,
            className: "grid grid-cols-[160px_1fr] items-center gap-2 my-0",
          };

        case ["integer", "bigint"].includes(type):
          return {
            type: "number",
            field,
            label: `${label}: `,
            className: "grid grid-cols-[160px_1fr] items-center gap-2 my-0",
          };

        case type === "boolean":
          return {
            type: "select",
            field,
            label,
            options: [
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ],
          };

        case type === "datetime":
          return {
            type: "dateRangePicker",
            field,
            label: `${label}: `,
            className: "grid grid-cols-[160px_1fr] items-center gap-2",
          };

        default:
          return {
            type: "text",
            field,
            label: `${label}: `,
            className:
              "grid grid-cols-[160px_1fr] items-center gap-2 w-full my-0",
          };
      }
    })
    .flat();
};
