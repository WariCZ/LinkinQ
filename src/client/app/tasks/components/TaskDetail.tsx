import ButtonExecuteBpmn from "../../../../client/components/ButtonExecuteBpmn";
import Form from "../../../../client/components/DynamicForm";
import { ModalPropsType } from "../../../../client/types/common/ModalPropsType";
import { TextInput } from "flowbite-react";
import { DateTime } from "luxon";

interface TaskDetailProps extends ModalPropsType {
  data?: any;
  entity: "tasks";
  refresh: (params?: { fields?: string[] }) => Promise<void>;
  setRecord: (d: any) => Promise<void>;
}

export const TaskDetail = (props: TaskDetailProps) => {
  const { data, entity, refresh, setRecord } = props;

  return (
    <>
      <div className="flex items-center justify-between px-4 bg-gray-100">
        {data?.guid && (
          <div className="flex items-center gap-1">
            <span>ID: </span> <TextInput value={data.guid} readOnly disabled />
          </div>
        )}
        {data?.workflowInstance && (
          <ButtonExecuteBpmn
            status={data.status}
            wf={data.workflowInstance}
            refresh={refresh}
          />
        )}
      </div>
      <Form
        onSubmit={({ data }) => {
          setRecord(data);
          props.closeModal && props.closeModal();
        }}
        {...props}
        data={{
          ...data,
          createtime: data?.createtime
            ? DateTime.fromISO(data?.createtime).toFormat("dd.MM.yyyy HH:mm:ss")
            : "",
          updatetime: data?.updatetime
            ? DateTime.fromISO(data?.updatetime).toFormat("dd.MM.yyyy HH:mm:ss")
            : "",
        }}
        entity={entity}
        columns={0}
        className="px-0"
        formFields={[
          {
            type: "Section",
            className: "px-4 pt-4 items-center bg-gray-100",
            columns: 1,
            fields: [
              {
                type: "text",
                field: "caption",
                label: "Title",
                required: true,
                className: "flex items-center w-full bg-gray-100",
                validate: (value) =>
                  value.length >= 3 || "Title must be at least 3 characters",
              },
            ],
          },
          {
            type: "Section",
            columns: 2,
            className: "px-4 items-center bg-gray-100 pt-2",
            fields: [
              {
                type: "text",
                field: "createdby",
                label: "Created by",
                required: false,
                readOnly: true,
              },
              {
                type: "text",
                field: "createtime",
                label: "Created time",
                required: false,
                readOnly: true,
                disabled: true,
              },
              {
                type: "text",
                field: "updatedby",
                label: "Updated by",
                required: false,
                readOnly: true,
                disabled: true,
              },
              {
                type: "text",
                field: "updatetime",
                label: "Updated time",
                required: false,
                readOnly: true,
                disabled: true,
              },
              {
                type: "text",
                field: "assignee",
                label: "Assignee",
                required: false,
                readOnly: true,
                className: "mb-2",
              },
              {
                field: "priority",
                type: "select",
                label: "Priority",
                className: "mb-2 mt-2",
              },
            ],
          },
          {
            type: "Tabs",
            tabs: [
              {
                name: "General",
                fields: [
                  {
                    field: "attn",
                    type: "text",
                    label: "Attention",
                    className: "mb-2 mt-2",
                  },
                  {
                    type: "richtext",
                    field: "description",
                    label: "Description",
                    className: "mb-2"
                  },
                  {
                    type: "Section",
                    columns: 2,
                    colSpan: 2,
                    fields: [
                      {
                        field: "effortPlanned",
                        type: "number",
                        label: "Effort planned:",
                        readOnly: true,
                        unit: "MD",
                      },
                      {
                        field: "effortSpent",
                        type: "number",
                        label: "Effort spent:",
                        readOnly: true,
                        unit: "MD",
                      },
                      {
                        field: "effortsWorked",
                        type: "number",
                        label: "Efforts worked (MD):",
                        unit: "MD",
                        validate: (value) =>
                          value === undefined ||
                          value === null ||
                          value === "" ||
                          value > 0 ||
                          "Value must be greater than 0",
                      },
                      {
                        field: "reportedEffort",
                        type: "number",
                        label: "Reported effort (MH):",
                        unit: "MH",
                        validate: (value) =>
                          value === undefined ||
                          value === null ||
                          value === "" ||
                          value > 0 ||
                          "Value must be greater than 0",
                      },
                    ],
                  },
                ],
              },
              {
                name: "Attachments",
                fields: [
                  {
                    type: "attachment",
                    field: "attachments",
                    label: "Attachments",
                    className: "mt-2"
                  },
                ],
              },
            ],
          },
        ]}
      />
    </>
  );
};
