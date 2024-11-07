import React from "react";
import useStore from "../store";
import { Button } from "flowbite-react";
import useDataApi from "../hooks/useDataApi";
import Table from "../components/Table";
import { Column } from "react-table";

const Journal: React.FC = () => {
  console.log("call ProtectedPage");
  const [
    data,
    setData,
    {
      loading: loadingData,
      refresh,
      fields,
      deleteRecord,
      filter,
      createRecord,
      highlightedRow,
    },
  ] = useDataApi(
    {
      entity: "journal",
      fields: [
        "id",
        "fields_old",
        "fields_diff",
        "fields_new",
        "entity",
        "operation",
      ],
      orderby: ["createtime-"],
    },
    [] as {
      fields_old: string;
      fields_diff: string;
      fields_new: string;
      guid: string;
    }[]
  );

  //   if (loadingData) return "Loading";

  const columns: any = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "entity",
      accessor: "entity",
    },
    {
      Header: "operation",
      accessor: "operation",
    },
    {
      Header: "fields_old",
      accessor: "fields_old",
      Cell: ({ value }: any) => JSON.stringify(value),
    },
    {
      Header: "fields_diff",
      accessor: "fields_diff",
      Cell: ({ value }: any) => JSON.stringify(value),
    },
    {
      Header: "fields_new",
      accessor: "fields_new",
      Cell: ({ value }: any) => JSON.stringify(value),
    },
  ];

  return (
    <div>
      <h1>Journal</h1>
      <Button onClick={() => refresh()}>reload</Button>
      <Button
        onClick={() => createRecord({ caption: "test", fullname: "test2" })}
      >
        Add
      </Button>
      <Table data={data} columns={columns} highlightedRow={highlightedRow} />
      {/* {data?.map((d, i) => (
        <p
          key={i}
          className={highlightedRow.indexOf(d.guid) > -1 ? "highlight" : ""}
        >
          Welcome, {d?.fullname}! {d?.guid}
          <span onClick={() => deleteRecord(d.guid)}>Smazat</span>
        </p>
      ))} */}
    </div>
  );
};

export default Journal;
