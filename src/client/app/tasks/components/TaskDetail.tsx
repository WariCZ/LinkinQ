import ButtonExecuteBpmn from "@/client/components/ButtonExecuteBpmn";
import Form from "@/client/components/DynamicForm";
import { ModalPropsType } from "@/client/types/common/ModalPropsType";
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
        formFields={[
          {
            type: "Section",
            className: "px-4 items-center bg-gray-100",
            fields: [
              {
                type: "text",
                field: "caption",
                label: "Title",
                className: "flex items-center w-full bg-gray-100",
                validate: (value) =>
                  value.length >= 3 || "Title must be at least 3 characters",
              },
            ],
          },

          {
            type: "Section",
            columns: 2,
            colSpan: 2,
            className: "px-4 items-center bg-gray-100",
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
                type: "select",
                field: "priority",
                label: "Priority",
                className: "mb-2",
                options: [
                  {
                    value: "none",
                    label: "Bez priority",
                  },
                  {
                    value: "low",
                    label: "Nízká",
                  },
                  {
                    value: "medium",
                    label: "Střední",
                  },
                  {
                    value: "high",
                    label: "Vysoká",
                  },
                  {
                    value: "very_high",
                    label: "Velmi vysoká",
                  },
                  {
                    value: "critical",
                    label: "Kritická",
                  },
                ],
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
                  },
                  {
                    type: "richtext",
                    field: "description",
                    label: "Description",
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
                        // customComponent: EffortField,
                        unit: "MD",
                      },
                      {
                        field: "effortSpent",
                        type: "number",
                        label: "Effort spent:",
                        readOnly: true,
                        // customComponent: EffortField,
                        unit: "MD",
                      },
                      {
                        field: "effortsWorked",
                        type: "number",
                        label: "Efforts worked (MD):",
                        // customComponent: EffortField,
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
                        // customComponent: EffortField,
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
