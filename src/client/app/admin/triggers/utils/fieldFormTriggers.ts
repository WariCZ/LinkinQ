import { FormFieldType } from "@/client/types/DynamicForm/types";

export const fieldFormTriggers = (schema: {}): (string | FormFieldType)[] => [
    {
      label: "Caption",
      field: "caption",
      type: "text",
      required: true,
    },
    {
      label: "Type",
      field: "type",
      type: "select",
      options: [
        {
          label: "Before",
          value: "before",
        },
        {
          label: "After",
          value: "after",
        },
      ],
      required: true,
    },
    {
      label: "Method",
      field: "method",
      type: "select",
      options: [
        {
          label: "Insert",
          value: "insert",
        },
        {
          label: "Update",
          value: "update",
        },
        {
          label: "Delete",
          value: "delete",
        },
      ],
      required: true,
    },
    {
      label: "Entity",
      field: "entity",
      required: true,
      type: "select",
      options: Object.keys(schema).map((s) => ({
        label: s,
        value: s,
      })),
    },
  ];
  