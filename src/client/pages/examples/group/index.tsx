import Table from "../../../components/Table";
import useDataTable from "../../../hooks/useDataTable";

export default function GroupExample() {
  const [
    data,
    setData,
    {
      loading,
      refresh,
      filter,
      highlightedRow,
      setOrdering,
      ordering,
      deleteRecord,
      hasMore,
      fetchNextPage,
    },
  ] = useDataTable(
    {
      entity: "tasks",
      fields: ["status", "createdby.createdby.fullname"],
      aggregate: [
        { type: "sum", field: "kind", alias: "moje_suma" },
        { type: "avg", field: "kind", alias: "moje_avg" },
        { type: "count", field: "kind", alias: "moje_count" },
      ],
      groupby: ["status", "createdby.createdby.fullname"],
      //   filter: filters,
    },
    []
  );

  const fieldKeys = [
    "caption",
    "createtime",
    "updatetime",
    "createdby.fullname",
    "updatedby.fullname",
    "workflowInstance.name",
    "workflowInstance.source",
    "workflowInstance.items",
    "status",
  ];

  const columns = [...fieldKeys];

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Table
        selectable
        isGroupBy
        // isExpanded
        tableConfigKey="tasks"
        entity={"tasks"}
        data={data}
        columns={columns}
        loading={loading}
        highlightedRow={highlightedRow}
        ordering={ordering}
        deleteRecord={deleteRecord}
        setOrdering={setOrdering}
        fetchNextPage={fetchNextPage}
        hasMore={hasMore}
      />
    </div>
  );
}
