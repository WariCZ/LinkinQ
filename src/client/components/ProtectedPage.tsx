import React from "react";
import useStore from "../store";
import { Button } from "flowbite-react";
import useDataApi from "../hooks/useDataApi";

const ProtectedPage: React.FC = () => {
  const user = useStore((state) => state.user);

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
    },
  ] = useDataApi(
    {
      entity: "users",
      fields: ["fullname", "guid"],
      // fields: fieldsInput.split(","),
      // filter: filterInput,
      // filter: {
      //   "createdby.fullname": "admin",
      //   guid: "3ba3734d-c49d-4a33-9405-c9bbb587fac1",
      // },
    },
    [] as { fullname: string; guid: string }[]
  );

  if (loadingData) return "Loading";

  return (
    <div>
      <Button color="primary">test</Button>
      <h1>Protected Page</h1>
      <Button onClick={() => refresh()}>reload</Button>
      <Button
        onClick={() => createRecord({ caption: "test", fullname: "test2" })}
      >
        Add
      </Button>
      {data?.map((d, i) => (
        <p key={i}>
          Welcome, {d?.fullname}! {d?.guid}
          <span onClick={() => deleteRecord(d.guid)}>Smazat</span>
        </p>
      ))}
    </div>
  );
};

export default ProtectedPage;
