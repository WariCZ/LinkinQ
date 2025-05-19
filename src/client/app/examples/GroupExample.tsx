import useDataTable from "../../hooks/useDataTable";

export function GroupExample() {
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
      fields: ["caption"],
      // ordering: [{ id: "createtime", desc: true }],
      ordering: [{ id: "createdby.fullname", desc: true }],
      structure: "topdown",
      // groupby: ["kind", "createdby.fullname", "caption"],
      //   filter: filters,
    },
    []
  );

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
