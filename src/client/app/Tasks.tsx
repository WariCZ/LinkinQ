import React from "react";
import useStore from "../store";
import { Button } from "flowbite-react";
import useDataApi from "../hooks/useDataApi";
import Table from "../components/Table";

import { useTranslation } from "react-i18next";
import useDataTable from "../hooks/useDataTable";
import { ColumnDef } from "@tanstack/react-table";

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

  console.log("ordering", ordering);
  return (
    <div className="m-3">
      <h1>Tasks</h1>
      <Button onClick={() => refresh()}>reload</Button>

      <Table
        data={data}
        columns={columns}
        loading={loading}
        highlightedRow={highlightedRow}
        ordering={ordering}
        setOrdering={setOrdering}
      />
    </div>
  );
};

export default Tasks;
