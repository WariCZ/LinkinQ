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

type TasksType = {
  guid: string;
  caption: string;
};
const Tasks = () => {
  const columns: TableFieldType[] = [
    {
      field: "guid",
    },
    {
      field: "caption",
    },
    {
      field: "description",
    },
  ];

  console.log("call ProtectedPage");

  const [
    data,
    setData,
    { loading, refresh, fields, filter, highlightedRow, setOrdering, ordering },
  ] = useDataTable(
    {
      entity: "tasks",
      fields: ["caption", "guid", "description"],
      ordering: [{ id: "caption", desc: false }],
    },
    []
  );

  const { openModal } = useModalStore();

  console.log("ordering", ordering);
  return (
    <div className="m-3">
      <h1>Tasks</h1>
      <Button onClick={() => refresh()}>reload</Button>

      <button
        onClick={() => openModal(<TaskDetail />)}
        // onClick={() => openModal((props: any) => <TaskDetail {...props} />)}
        className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
      >
        Otevřít Modální Okno
      </button>
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
  const [data, setData, { setRecord, loading }] = useDataDetail({
    entity: "tasks",
    guid: props?.data?.guid,
  });

  if (loading) return "loading";
  return (
    <Form
      onSubmit={(props) => {
        debugger;
        setRecord(props.data);
        props.closeModal && props.closeModal();
      }}
      data={data}
      entity={"tasks"}
      formFields={["caption", "description"]}
      {...props}
    />
  );
};
export default Tasks;
