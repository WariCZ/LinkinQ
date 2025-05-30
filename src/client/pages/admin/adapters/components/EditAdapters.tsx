import Form from "../../../../components/DynamicForm";
import { ModalPropsType } from "../../../../types/common/ModalPropsType";
import useDataDetail from "../../../../hooks/useDataDetail";
import axios from "axios";
import { Button } from "flowbite-react";

export const EditAdapters = (props: ModalPropsType & { guid: string }) => {
  // const [adapters, setAdapters] = useState([]);

  const [adapter, setAdapter, { setRecord }] = useDataDetail({
    entity: "adapters",
    guid: props.guid,
  });

  // const [selectedAdapter, setSelectedAdapter] = useState(undefined as any);
  // const getRoutes = async () => {
  //   const ret = await axios.get("/adapters/adaptersType");
  //   setAdapters(ret.data || []);
  // };

  // useEffect(() => {
  //   getRoutes();
  // }, []);

  if (!adapter) return null;
  return (
    <div>
      AddAdapters
      <div>
        <Form
          onSubmit={async ({ data, setError }) => {
            debugger;
            // setRecord(data);
            await axios.post("/adapters/setAdapter", {
              ...data,
              type: (adapter as any).type,
            });
          }}
          // onChange={({ data }) => {
          //   if (data.adapterType)
          //     setSelectedAdapter(adapters[data.adapterType]);
          // }}
          entity="adapters"
          columns={1}
          data={adapter}
          formFields={[
            {
              type: "text",
              field: "type",
              label: "Type",
              readOnly: true,
            },
            {
              type: "text",
              field: "caption",
              readOnly: true,
            },
            {
              type: "checkbox",
              field: "active",
            },
            // ...(selectedAdapter?.form || []),
          ]}
          formRef={props.formRef}
        >
          <Button type="submit" className="inline-block">
            Ulozit
          </Button>
        </Form>
      </div>
    </div>
  );
};
