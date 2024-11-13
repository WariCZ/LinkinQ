import React from "react";
import useStore from "../store";
import { Button, TextInput } from "flowbite-react";
import Table from "../components/Table";

import useDataTable from "../hooks/useDataTable";
import { ColumnDef } from "@tanstack/react-table";
import Form from "../components/Form";
import { useModalStore } from "../components/Modal/modalStore";
import { FieldType } from "@/lib/entity/types";
import { Schema } from "@bpmn-io/form-js";

type TasksType = {
  guid: string;
  caption: string;
};
const Tasks = () => {
  const columns: ColumnDef<TasksType, unknown>[] = [
    {
      id: "guid",
      header: "guid",
      accessorKey: "guid",
      size: 200,
    },
    {
      id: "caption",
      header: "caption",
      accessorKey: "caption",
      size: 200,
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
      fields: ["caption", "guid"],
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
        data={data}
        columns={columns}
        loading={loading}
        highlightedRow={highlightedRow}
        ordering={ordering}
        setOrdering={setOrdering}
      />

      <TextInput data-testid="login-password" type="password" required />
    </div>
  );
};

type FormField = {
  id?: string;
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  conditional?: {
    hide: string;
  };
  type: "textfield" | "textarea";
  readonly?: boolean;
  disabled?: boolean;
  appearance?: {
    prefixAdorner?: string;
    suffixAdorner?: string;
  };
  validate?: {
    required?: boolean;
  };
};
const translateSchemaToForm = (fields: FieldType[]) => {
  return Object.keys(fields).map((name: any) => {
    const f = fields[name];
    const field: FormField = {
      key: name,
      label: f.label || "",
      type: "textarea",
      disabled: f.system,
    };
    if (f.isRequired) {
      field.validate = {
        required: true,
      };
    }

    return field;
  });
};

const TaskDetail = (props: any) => {
  const schema: any = useStore((state) => state.schema);
  const formFields = {
    type: "default",
    components: translateSchemaToForm(schema["tasks"]),
  };
  return (
    <>
      <Form
        onSubmit={(props) => {
          if (props.isValid) {
            props.closeModal && props.closeModal();
          }
        }}
        schema={formFields}
        // schema={{
        //   type: "default",
        //   components: [

        //     {
        //       key: "name",
        //       label: "Name",
        //       type: "textfield",
        //       validate: {
        //         required: true,
        //       },
        //     },
        //     {
        //       key: "namde",
        //       label: "Namedwa",
        //       type: "textfield",
        //       validate: {
        //         required: true,
        //       },
        //     },
        //   ],
        // }}
        {...props}
      />
    </>
  );
};
export default Tasks;
