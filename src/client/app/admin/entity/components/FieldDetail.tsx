import useStore from "../../../../../client/store";
import React from "react";
import Form from "../../../../../client/components/DynamicForm";
import { httpRequest } from "../../../../../client/services/httpBase";
import { ModalPropsType } from "../../../../../client/types/common/ModalPropsType";

export const FieldDetail = (
  props: { entity: string; data?: object } & ModalPropsType
) => {
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
          label: "Name",
          field: "name",
          required: true,
          type: "text",
        },
        {
          label: "Label",
          field: "label",
          required: true,
          type: "text",
        },
        {
          field: "type",
          label: "Type",
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
          label: "Entity",
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
          label: "Description",
          field: "description",
          type: "text",
        },
      ]}
      formRef={props.formRef}
    />
  );
};
