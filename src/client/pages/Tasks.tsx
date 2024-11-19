import React from "react";
import useStore from "../store";
import { Button, TextInput } from "flowbite-react";
import Table, { TableFieldType } from "../components/Table";

import useDataTable from "../hooks/useDataTable";
import { ColumnDef } from "@tanstack/react-table";
import Form from "../components/Form/Form";
import { useModalStore } from "../components/Modal/modalStore";
import { FieldType } from "@/lib/entity/types";
import { Description, Schema } from "@bpmn-io/form-js";
import useDataDetail from "../hooks/useDataDetail";
import { BpmnJsReact, useBpmnJsReact } from "bpmn-js-react";

const Tasks = () => {
  const schema = useStore((state) => state.schema);

  const columns = [
    ...["guid", "caption", "createdby.fullname"],
    ...(schema["tasks"]
      ? Object.keys(schema["tasks"].fields).filter((f) => {
          return !schema["tasks"].fields[f].system;
        })
      : []),
  ];

  console.log("call ProtectedPage", columns);

  const [
    data,
    setData,
    { loading, refresh, fields, filter, highlightedRow, setOrdering, ordering },
  ] = useDataTable(
    {
      entity: "tasks",
      fields: columns, //["caption", "guid", "description"],
      ordering: [{ id: "caption", desc: false }],
    },
    []
  );

  const { openModal } = useModalStore();

  console.log("ordering", ordering);
  return (
    <div className="m-3">
      <h1>Tasks</h1>
      <Button className="mb-1" onClick={() => openModal(<TaskDetail />)}>
        Add
      </Button>

      <Table
        entity="tasks"
        data={data}
        rowClick={(data) => openModal(<TaskDetail data={data} />)}
        columns={columns}
        loading={loading}
        highlightedRow={highlightedRow}
        ordering={ordering}
        setOrdering={setOrdering}
      />
    </div>
  );
};

const TaskDetail = (props: any) => {
  const schema = useStore((state) => state.schema);
  const fields = Object.keys(schema["tasks"].fields).filter((f) => {
    return (
      !schema["tasks"].fields[f].system ||
      f === "caption" ||
      f === "description"
    );
  });

  const [data, setData, { setRecord, loading }] = useDataDetail(
    {
      entity: "tasks",
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

  console.log("data", data);
  debugger;
  if (loading) return "loading";
  return (
    <>
      {data.workflowInstance && (
        <BPMNInstance
          name={data.workflowInstance.name}
          source={data.workflowInstance.source}
          items={data.workflowInstance.items}
        />
      )}
      <Form
        onSubmit={(props) => {
          delete props.data.createdby;
          setRecord(props.data);
          props.closeModal && props.closeModal();
        }}
        data={data}
        entity={"tasks"}
        formFields={fields}
        {...props}
      />
    </>
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

  // const [data, setData, { setRecord, loading }] = useDataDetail(
  //   {
  //     entity: "wf_instances",
  //     fields: ["source", "name", "items"],
  //     guid: workflowInstance,
  //   },
  //   {} as { source: string; name: string; items: any[] }
  // );
  // if (loading) return "loading";
  const data = { items: [] as any };
  const handleShown = (viewer: any) => {
    console.log("data", data);
    debugger;
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
      <div>{name}</div>
      <BpmnJsReact
        useBpmnJsReact={bpmnReactJs}
        mode="edit"
        xml={source}
        onShown={handleShown}
        // click={test}
      />
    </div>
  );
};
export default Tasks;
