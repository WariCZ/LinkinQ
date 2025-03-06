import ButtonExecuteBpmn from "@/client/components/ButtonExecuteBpmn";
import Form from "@/client/components/DynamicForm";
import EffortField from "@/client/components/DynamicForm/fields/EffortField";
import { ModalPropsType } from "@/client/types/common/ModalPropsType";
import useDataDetail from "@/client/hooks/useDataDetail";
import useStore from "@/client/store";
import { TextInput } from "flowbite-react";
import { DateTime } from "luxon";

interface TaskDetailProps extends ModalPropsType {
    data?: any,
    entity: "tasks",
}

export const TaskDetail = (props: TaskDetailProps) => {
    const entity = props.entity;
    const schema = useStore((state) => state.schema);
    const fields = Object.keys(schema[entity].fields).filter((f) => {
        return (
            !schema[entity].fields[f].system || f === "caption" || f === "description"
        );
    });

    const [data, setData, { setRecord, loading, refresh }] = useDataDetail(
        {
            entity: entity,
            guid: props?.data?.guid,
            fields: [
                ...fields,
                "workflowInstance.name",
                "workflowInstance.source",
                "workflowInstance.items",
                "status",
                "createtime",
                "createdby",
                "updatetime",
                "updatedby",
                "attachments.caption",
            ],
        },
        {} as any
    );

    return (
        <>
            <div className="flex items-center justify-between">
                {data.guid && <div className="flex items-center gap-1"><span>ID: </span> <TextInput value={data.guid} readOnly disabled /></div>}
                {data.workflowInstance && (
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
                    createtime: data.createtime
                        ? DateTime.fromISO(data.createtime).toFormat("dd.MM.yyyy HH:mm:ss")
                        : "",
                    updatetime: data.updatetime
                        ? DateTime.fromISO(data.updatetime).toFormat("dd.MM.yyyy HH:mm:ss")
                        : "",
                }}
                entity={entity}
                formFields={[
                    {
                        "type": "text",
                        "field": "caption",
                        "label": "Title",
                        validate: (value) => value.length >= 3 || "Title must be at least 3 characters",
                    },
                    {
                        "type": "Section",
                        "columns": 2,
                        "colSpan": 2,
                        "fields": [
                            {
                                "type": "text",
                                "field": "createdby",
                                "label": "Created by",
                                "required": false,
                                "readOnly": true
                            },
                            {
                                "type": "text",
                                "field": "createtime",
                                "label": "Created time",
                                "required": false,
                                "readOnly": true,
                                "disabled": true,
                            },
                            {
                                "type": "text",
                                "field": "updatedby",
                                "label": "Updated by",
                                "required": false,
                                "readOnly": true,
                                "disabled": true,
                            },
                            {
                                "type": "text",
                                "field": "updatetime",
                                "label": "Updated time",
                                "required": false,
                                "readOnly": true,
                                "disabled": true,
                            },
                            {
                                "type": "text",
                                "field": "assignee",
                                "label": "Assignee",
                                "required": false,
                                "readOnly": true
                            },
                            {
                                "type": "select",
                                "field": "priority",
                                "label": "Priority",
                                "options": [
                                    {
                                        "value": "none",
                                        "label": "Bez priority"
                                    },
                                    {
                                        "value": "low",
                                        "label": "Nízká"
                                    },
                                    {
                                        "value": "medium",
                                        "label": "Střední"
                                    },
                                    {
                                        "value": "high",
                                        "label": "Vysoká"
                                    },
                                    {
                                        "value": "very_high",
                                        "label": "Velmi vysoká"
                                    },
                                    {
                                        "value": "critical",
                                        "label": "Kritická"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "Tabs",
                        "tabs": [
                            {
                                "name": "General",
                                "fields": [
                                    {
                                        "field": "attn",
                                        "type": "text",
                                        "label": "Attention"
                                    },
                                    {
                                        "type": "richtext",
                                        "field": "richtext",
                                        "label": "Description"
                                    },
                                    {
                                        "type": "Section",
                                        "columns": 2,
                                        "colSpan": 2,
                                        "fields": [
                                            {
                                                field: "effortPlanned",
                                                type: "number",
                                                label: "Effort planned:",
                                                readOnly: true,
                                                customComponent: EffortField,
                                                unit: "MD"
                                            },
                                            {
                                                field: "effortSpent",
                                                type: "number",
                                                label: "Effort spent:",
                                                readOnly: true,
                                                customComponent: EffortField,
                                                unit: "MD"
                                            },
                                            {
                                                field: "effortsWorked",
                                                type: "number",
                                                label: "Efforts worked (MD):",
                                                customComponent: EffortField,
                                                unit: "MD",
                                                validate: (value) => value > 0 || "Value must be greater than 0",
                                            },
                                            {
                                                field: "reportedEffort",
                                                type: "number",
                                                label: "Reported effort (MH):",
                                                customComponent: EffortField,
                                                unit: "MH",
                                                validate: (value) => value > 0 || "Value must be greater than 0",
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "Attachments",
                                "fields": [
                                    {
                                        "type": "attachment",
                                        "field": "attachments",
                                        "label": "Attachments"
                                    }
                                ]
                            }
                        ]
                    }
                ]}
            />
        </>
    );
};
