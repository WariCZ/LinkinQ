import React, { useEffect, useMemo, useState } from "react";
import useStore from "../../store";
import { Button, Dropdown } from "flowbite-react";
import Table from "../../components/Table";

import useDataTable from "../../hooks/useDataTable";
import Form, { FormFieldType } from "../../components/Form/Form";
import { useModalStore } from "../../components/Modal/modalStore";
import useDataDetail from "../../hooks/useDataDetail";
import { BpmnJsReact, useBpmnJsReact } from "bpmn-js-react";
import axios from "axios";
import { ModalPropsType } from "../../components/Modal/ModalContainer";
import { FaPlus } from "react-icons/fa";
import { MdOutlineSchema } from "react-icons/md";
import { useLocation } from "react-router-dom";
import _, { assign } from "lodash";
import { useTranslation } from "react-i18next";
import ReactSelect, { Props as ReactSelectProps } from "react-select";

const QueryBuilder = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const filters = location?.state?.filter;
  const header = location?.state?.header;

  const schema = useStore((state) => state.schema);

  const [entity, setEntity] = useState("tasks" as string);

  const columns = [
    ...["guid", "caption", "createtime", "createdby.fullname"],
    // ...(schema[entity]
    //   ? Object.keys(schema[entity].fields)
    //       .filter((f) => {
    //         return !schema[entity].fields[f].system;
    //       })
    //       .map((f) => {
    //         if (schema[entity].fields[f].link) {
    //           if (schema[entity].fields[f].link === "users") {
    //             return f + ".fullname";
    //           } else {
    //             return f + ".caption";
    //           }
    //         } else {
    //           return f;
    //         }
    //       })
    //   : []),
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

  return (
    <div className="mx-3">
      <div className="flex items-center justify-between my-3">
        <div className="flex space-x-2">
          <h1 className="text-2xl font-bold">
            {header || t("page.admin.querybuilder")}
          </h1>
        </div>
        <div>
          <Button
            className="inline-block mr-2"
            onClick={() => openModal(<QueryBuilderDetail entity={entity} />)}
          >
            <FaPlus className="ml-0 m-1 h-3 w-3" />
            {t("add")}
          </Button>
          <Button className="inline-block" onClick={() => refresh()}>
            <FaPlus className="ml-0 m-1 h-3 w-3" />
            {t("refresh")}
          </Button>
        </div>
      </div>
      <div>
        <ReactSelect
          classNamePrefix="flowbite-select"
          options={_.keys(schema).map((o) => ({ value: o, label: o }))}
          value={{ value: entity, label: entity }}
          styles={{
            option: (base, props) => ({
              ...base,
              padding: "3px 10px",
            }),
          }}
          onChange={(selectedOptions, b) => {
            setEntity(selectedOptions.value);
          }}
        />
      </div>
      <Table
        entity={entity}
        data={data}
        rowClick={(data) =>
          openModal(<QueryBuilderDetail data={data} entity={entity} />)
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

const QueryBuilderDetail = (props: any) => {
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
      ],
    },
    {} as any
  );

  if (loading) return "loading";
  return (
    <>
      {data.workflowInstance && (
        <ButtonExecuteBpmn wf={data.workflowInstance} refresh={refresh} />
      )}
      <Form
        onSubmit={({ data }) => {
          debugger;

          setRecord(data);
          props.closeModal && props.closeModal();
        }}
        {...props}
        data={data}
        entity={entity}
        formFields={fields}
      />
    </>
  );
};

const ButtonExecuteBpmn = ({ wf, refresh }: { wf: any; refresh: any }) => {
  const { openModal } = useModalStore();

  const [dropdown, setDropdown] = useState([]);

  let actualName = "Execute";
  let actualItem;
  wf.items.forEach((item) => {
    if (item.status == "wait") {
      actualName = item.name;
      actualItem = item;
    }
    if (item.elementId == "event_end") {
      actualName = "Closed";
      actualItem = item;
    }
  });

  const executeProcess = async () => {
    const executeItems = wf.items.filter((item) => item.status !== "end");

    if (executeItems.length === 1) {
      const { data } = await axios.post("/bpmnapi/invokeHaveFields", {
        id: executeItems[0].id,
      });
      debugger;
      const moveSteps = [];
      data.fields.map((f) => {
        if (f.id == "move" && f.$children && f.$children.length) {
          f.$children.map((child) => {
            moveSteps.push({ text: child.name, value: child.name.id });
          });
          setDropdown(moveSteps);
        }
      });

      return;
      if (data.fields && data.fields.length > 0) {
        openModal(
          <ExecuteForm
            fields={data.fields}
            id={executeItems[0].id}
            modalLabel="Form parameters"
            closeModal={() => {
              debugger;
            }}
          />
        );
      } else {
        await axios.post("/bpmnapi/invoke", {
          id: executeItems[0].id,
        });
        refresh();
      }
    }
  };

  //data.fields.filter((f) => f.id == "move");

  return (
    <span className="flex items-center my-3 justify-end">
      <MdOutlineSchema
        className="mx-1 cursor-pointer"
        onClick={() =>
          openModal(
            <BPMNInstance name={wf.name} source={wf.source} items={wf.items} />
          )
        }
      />

      <Dropdown
        className="w-40"
        label={
          <span
            onClick={executeProcess}
            title="Execute"
            className="bg-green-500 text-white px-4 py-0 rounded hover:bg-green-600 cursor-pointer"
          >
            {actualName}
          </span>
        }
        arrowIcon={false}
        inline
      >
        <Dropdown.Header>
          <span className="block text-sm font-bold">Select next step</span>
        </Dropdown.Header>

        {dropdown.map((d) => {
          return (
            <Dropdown.Item
              onClick={() => {
                debugger;
              }}
            >
              {d.text}
            </Dropdown.Item>
          );
        })}
        {/* <Dropdown.Divider /> */}
      </Dropdown>
    </span>
  );
};

const BPMNInstance = ({
  name,
  source,
  items,
}: {
  name: string;
  source: string;
  items: [];
}) => {
  const bpmnReactJs = useBpmnJsReact();

  const handleShown = (viewer: any) => {
    items?.map((item: any) => {
      if (item.status === "end") {
        bpmnReactJs.addMarker(item.elementId, "Completed");
      }
      if (item.status === "wait") {
        bpmnReactJs.addMarker(item.elementId, "Pending");
      }
    });
  };

  return (
    <div className="bpmnView">
      <div className="font-bold">{name}</div>
      <BpmnJsReact
        useBpmnJsReact={bpmnReactJs}
        mode="edit"
        xml={source}
        onShown={handleShown}
      />
    </div>
  );
};
export default QueryBuilder;
