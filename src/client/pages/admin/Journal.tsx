import React from "react";
import { Button } from "flowbite-react";
import useDataApi from "../../hooks/useDataDetail";
import Table, { TableFieldType } from "../../components/Table";
import { ColumnDef } from "@tanstack/react-table";
import useDataTable from "../../hooks/useDataTable";

const Journal: React.FC = () => {
  console.log("call ProtectedPage");
  const [
    data,
    setData,
    { loading: loadingData, refresh, fields, filter, highlightedRow },
  ] = useDataTable(
    {
      entity: "journal",
      fields: [
        "id",
        "user",
        "fields_old",
        "fields_diff",
        "fields_new",
        "entity",
        "operation",
      ],
      ordering: [{ id: "createtime", desc: true }],
    },
    [] as {
      fields_old: string;
      fields_diff: string;
      fields_new: string;
      guid: string;
    }[]
  );

  //   if (loadingData) return "Loading";

  const columns: TableFieldType[] = [
    "id",
    "entity",
    "user",
    "operation",
    {
      field: "fields_diff",
      cell: ({ getValue }) => JSON.stringify(getValue()),
    },
    {
      field: "fields_new",
      cell: ({ getValue }) => JSON.stringify(getValue()),
      size: 150,
      maxSize: 200,
    },
    {
      field: "fields_old",
      cell: ({ getValue }) => JSON.stringify(getValue()),
      size: 150,
    },
  ];

  return (
    <div>
      <h1>Journal</h1>
      <Button onClick={() => refresh()}>reload</Button>
      <Table
        data={data}
        columns={columns}
        highlightedRow={highlightedRow}
        entity="journal"
      />
    </div>
  );
};

export default Journal;
