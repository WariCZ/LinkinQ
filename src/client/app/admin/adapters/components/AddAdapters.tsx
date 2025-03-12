import Form from "@/client/components/DynamicForm";
import { ModalPropsType } from "@/client/types/common/ModalPropsType";
import axios from "axios";
import _ from "lodash";
import { useEffect, useState } from "react";

export const AddAdapters = (props: ModalPropsType) => {
  const [adapters, setAdapters] = useState([]);
  const [selectedAdapter, setSelectedAdapter] = useState(undefined as any);
  const getRoutes = async () => {
    const ret = await axios.get("/adapters/adaptersType");
    setAdapters(ret.data || []);
  };

  useEffect(() => {
    getRoutes();
  }, []);

  return (
    <div>
      AddAdapters
      <div>
        <Form
          onSubmit={async ({ data, setError }) => {
            debugger;
            await axios.post("/adapters/setAdapter", data);
          }}
          onChange={({ data }) => {
            if (data.type) setSelectedAdapter(adapters[data.type]);
          }}
          //   data={}
          formFields={[
            {
              type: "select",
              field: "type",
              label: "Type",
              required: true,
              options: _.keys(adapters)?.map((item) => ({
                value: item,
                label: item,
              })),
            },
            ...(selectedAdapter?.form || []),
          ]}
          formRef={props.formRef}
        />
      </div>
    </div>
  );
};
