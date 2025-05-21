import useDataTable from "../../../../src/client/hooks/useDataTable";

export function TreeExample() {
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
      ordering: [{ id: "createtime", desc: true }],
      structure: "topdown",
      //   filter: filters,
    },
    []
  );

  return (
    <div>
      <TestTree data={data}></TestTree>
    </div>
  );
}

const TestTree = ({ data }: any) => {
  return (
    <ul className="pl-4 list-disc">
      {data.map((node) => (
        <li key={node.guid} data-guid={node.guid}>
          <div className="font-medium">
            {node.caption}{" "}
            <span className="text-sm text-gray-500">({node.status})</span>
          </div>
          {node.children.length > 0 && <TestTree data={node.children} />}
        </li>
      ))}
    </ul>
  );
};
