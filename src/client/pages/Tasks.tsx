import React, { useEffect } from "react";
import useStore from "../store";
import { Button } from "flowbite-react";
import Table from "../components/Table";
import useDataTable from "../hooks/useDataTable";
import Form from "../components/Form";
import { FormFieldType } from "../components/Form/types";
import { useModalStore } from "../components/Modal/modalStore";
import useDataDetail from "../hooks/useDataDetail";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import ButtonExecuteBpmn from "../components/ButtonExecuteBpmn";
import { DateTime } from "luxon";
import { ModalPropsType } from "../components/Modal/ModalContainer";

const Tasks = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const filters = location?.state?.filter;
  const header = location?.state?.header;

  const schema = useStore((state) => state.schema);

  const entity = "tasks";
  const columns = [
    ...[
      /*"guid",*/ "caption",
      "createtime",
      "updatetime",
      "createdby.fullname",
      "updatedby.fullname",
    ],
    ...(schema[entity]
      ? Object.keys(schema[entity].fields)
        .filter((f) => {
          return !schema[entity].fields[f].system;
        })
        .map((f) => {
          if (schema[entity].fields[f].link) {
            if (schema[entity].fields[f].link === "users") {
              return f + ".fullname";
            } else {
              return f + ".caption";
            }
          } else {
            return f;
          }
        })
      : []),
    ...["status"],
  ];

  console.log("call ProtectedPage", columns);

  const [
    data,
    setData,
    { loading, refresh, fields, filter, highlightedRow, setOrdering, ordering },
  ] = useDataTable(
    {
      entity: entity,
      fields: columns, //["caption", "guid", "description"],
      ordering: [{ id: "createtime", desc: true }],
      filter: filters,
    },
    []
  );

  useEffect(() => {
    if (!_.isEqual(filter, filters)) {
      refresh({ filter: filters || {} });
    }
  }, [filters]);

  const { openModal } = useModalStore();

  console.log("Tasks data", data);
  return (
    <div className="mx-3">
      <div className="flex items-center justify-between my-3">
        <div className="flex space-x-2">
          <Button onClick={() => openModal(<TaskDetail entity={entity} />, {
            title: t("Create tasks"),
            size: "lg",
            modalSingle: true,
          })}>
            <FaPlus className="ml-0 m-1 h-3 w-3" />
            {t("add")}
          </Button>
          <h1 className="text-2xl font-bold">{header || t("page.tasks")}</h1>
        </div>
      </div>
      <Table
        entity={entity}
        data={data}
        rowClick={(data) =>
          openModal(<TaskDetail data={data} entity={entity} />)
        }
        columns={columns}
        loading={loading}
        highlightedRow={highlightedRow}
        ordering={ordering}
        setOrdering={setOrdering}
      />
    </div>
  );
};

const ExecuteForm = (props: { fields: any; id: string } & ModalPropsType) => {
  const formFields = props.fields.map((f): FormFieldType => {
    return {
      type: "text", // f.type === "boolean" ? "checkbox" :
      field: f.id,
      label: f.label,
    };
  });

  return (
    <div>
      <Form
        onSubmit={async ({ data }) => {
          const x = await axios.post("/bpmnapi/invoke", {
            id: props.id,
            itemFields: {
              approved: false,
            },
          });
          props.closeModal && props.closeModal();
        }}
        {...props}
        data={{}}
        formFields={formFields}
      />
    </div>
  );
};

const TaskDetail = (props: any) => {
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

  //if (loading) return "loading";
  return (
    <>
      {data.workflowInstance && (
        <ButtonExecuteBpmn
          status={data.status}
          wf={data.workflowInstance}
          refresh={refresh}
        />
      )}
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
            "label": "Title"
          },
          {
            "type": "Section",
            "columns": 2,
            "colSpan": 2,
            "fields": [
              {
                "field": "createdby",
                "label": "Created by",
                "required": false,
                "readOnly": true
              },
              {
                "field": "createtime",
                "label": "Created time",
                "required": false,
                "readOnly": true
              },
              {
                "field": "updatedby",
                "label": "Updated by",
                "required": false,
                "readOnly": true
              },
              {
                "field": "updatetime",
                "label": "Updated time",
                "required": false,
                "readOnly": true
              },
              {
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
                    "gap": 1,
                    "fields": [
                      {
                        "field": "effortPlanned",
                        "label": "Effort Planned (MD)",
                        "customComponent": "EffortField"
                      },
                      {
                        "field": "effortSpent",
                        "label": "Effort Spent (MD)",
                        "readOnly": true,
                        "customComponent": "EffortField"
                      },
                      {
                        "field": "effortsWorked",
                        "label": "Efforts Worked (MD)",
                        "readOnly": true,
                        "customComponent": "EffortField"
                      },
                      {
                        "field": "reportedEffort",
                        "label": "Reported Effort (MH)",
                        "customComponent": "EffortField"
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

export default Tasks;
