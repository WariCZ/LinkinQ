/* @vite-ignore */
import useDataTable from "../../hooks/useDataTable";
import Table from "../../components/Table";

const TestPage = () => {
  const entity = "tasks";
  const columns = ["caption"];

  const [
    data,
    setData,
    { loading, refresh, fields, filter, highlightedRow, setOrdering, ordering },
  ] = useDataTable(
    {
      entity: entity,
      fields: columns, //["caption", "guid", "description"],
      ordering: [{ id: "createtime", desc: true }],
    },
    []
  );

  return (
    <div>
      TestPage s
      <Table
        entity={entity}
        data={data}
        // rowClick={(data) =>
        //   openModal(<TaskDetail data={data} entity={entity} />)
        // }
        columns={columns}
        loading={loading}
        highlightedRow={highlightedRow}
        ordering={ordering}
        setOrdering={setOrdering}
      />
    </div>
  );
};

export default TestPage;
