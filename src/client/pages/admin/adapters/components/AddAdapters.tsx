import Form from "../../../../components/DynamicForm";
import { ModalPropsType } from "../../../../types/common/ModalPropsType";
import axios from "axios";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const AddAdapters = (props: ModalPropsType) => {
  const [adapters, setAdapters] = useState([]);
  const { t } = useTranslation();
  const [selectedAdapter, setSelectedAdapter] = useState(undefined as any);
  const getRoutes = async () => {
    const ret = await axios.get("/adapters/adaptersType");
    setAdapters(ret.data || []);
  };

  useEffect(() => {
    getRoutes();
  }, []);

  return (
    <Form
      onSubmit={async ({ data, setError }) => {
        debugger;
        await axios.post("/adapters/setAdapter", data);
      }}
      onChange={({ data }) => {
        if (data.type) setSelectedAdapter(adapters[data.type]);
      }}
      columns={1}
      formFields={[
        {
          type: "select",
          field: "type",
          label: t("labels.type"),
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
  );
};
