import { useTranslation } from "react-i18next";
import { FormFieldType } from "../../../../types/DynamicForm/types";

export const fieldFormTriggers = (schema: {}): (string | FormFieldType)[] => {
  const { t: tTriggers } = useTranslation("triggers");
  const { t } = useTranslation();

  return [
    {
      label: tTriggers("labels.caption"),
      field: "caption",
      type: "text",
      required: true,
    },
    {
      label: t("labels.type"),
      field: "type",
      type: "select",
      options: [
        {
          label: tTriggers("labels.before"),
          value: "before",
        },
        {
          label: tTriggers("labels.after"),
          value: "after",
        },
      ],
      required: true,
    },
    {
      label: tTriggers("labels.method"),
      field: "method",
      type: "select",
      options: [
        {
          label: tTriggers("labels.insert"),
          value: "insert",
        },
        {
          label: t("labels.update"),
          value: "update",
        },
        {
          label: t("labels.delete"),
          value: "delete",
        },
      ],
      required: true,
    },
    {
      label: t("labels.entity"),
      field: "entity",
      required: true,
      type: "select",
      options: Object.keys(schema).map((s) => ({
        label: s,
        value: s,
      })),
    },
  ];
};
