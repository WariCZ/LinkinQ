import useStore from "../../../../store";
import React from "react";
import Form from "../../../../components/DynamicForm";
import { httpRequest } from "../../../../services/httpBase";
import { ModalPropsType } from "../../../../types/common/ModalPropsType";
import { useTranslation } from "react-i18next";

export const FieldDetail = (
  props: { entity: string; data?: object } & ModalPropsType
) => {
  const { t } = useTranslation();
  const getSchema = useStore((state) => state.getSchema);
  return (
    <Form
      disabled={!!props.data}
      onSubmit={async ({ data }) => {
        if (data.type.indexOf("link") > -1) {
          data.type = `${data.type}(${data.entity})`;
          delete data.entity;
        }

        await httpRequest({
          url: "/api/entityField",
          method: "POST",
          entity: "",
          data: {
            entity: props.entity,
            fields: [
              {
                type: data.type,
                name: data.name,
                label: data.label,
                description: data.description,
              },
            ],
          },
        });
        getSchema();
        props.closeModal && props.closeModal();
      }}
      data={props.data}
      columns={1}
      formFields={[
        {
          label: t("labels.name"),
          field: "name",
          required: true,
          type: "text",
        },
        {
          label: t("labels.label"),
          field: "label",
          required: true,
          type: "text",
        },
        {
          field: "type",
          label: t("labels.type"),
          type: "select",
          required: true,
          options: [
            { label: "text", value: "text" },
            { label: "link", value: "link" },
            { label: "nlink", value: "nlink" },
          ],
        },
        {
          field: "entity",
          label: t("labels.entity"),
          type: "select",
          required: true,
          options: [
            { label: "users", value: "users" },
            { label: "tasks", value: "tasks" },
          ],
          rules: [
            {
              type: "show",
              conditions: [
                {
                  type: "link",
                },
                {
                  type: "nlink",
                },
              ],
            },
          ],
        },
        {
          label: t("labels.description"),
          field: "description",
          type: "text",
        },
      ]}
      formRef={props.formRef}
    />
  );
};
