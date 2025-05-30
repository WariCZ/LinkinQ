import { ModalPropsType } from "../../../types/common/ModalPropsType";
import useStore from "../../../store";
import useDataDetail from "../../../hooks/useDataDetail";
import DynamicForm from "../../../components/DynamicForm";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";

interface ConfigurableFormProps extends ModalPropsType {
  data?: any;
  entity: "tasks";
}

export const ConfigurableForm = (props: ConfigurableFormProps) => {
  const { t } = useTranslation();
  const entity = props.entity;

  const schema = useStore((state) => state.schema);
  const fields = Object.keys(schema[entity].fields).filter((f) => {
    return (
      !schema[entity].fields[f].system || f === "caption" || f === "description"
    );
  });

  const [data, setData, { setRecord, loading, refresh }] = useDataDetail(
    {
      entity: entity,
      guid: props.data?.guid,
      fields: [
        ...fields,
        "workflowInstance.name",
        "workflowInstance.source",
        "workflowInstance.items",
        "status",
        "createtime",
        "createdby",
        "updatetime",
        "updatedby",
        "attachments.caption",
      ],
    },
    {} as any
  );

  return (
    <div className="p-4">
      <DynamicForm
        isConfigurable
        tableConfigKey="taskManual"
        {...props}
        data={{
          ...data,
          createtime: data.createtime
            ? DateTime.fromISO(data.createtime).toFormat("dd.MM.yyyy HH:mm:ss")
            : "",
          updatetime: data.updatetime
            ? DateTime.fromISO(data.updatetime).toFormat("dd.MM.yyyy HH:mm:ss")
            : "",
        }}
        entity={entity}
        formFields={[
          {
            type: "Section",
            label: "Section1",
            fields: [
              { label: "text", field: "richtextfield", type: "richtext" },
              { label: "number", field: "number", type: "number" },
              { label: "password", field: "password", type: "password" },
              { label: "datetime", field: "datetime", type: "datetime" },
            ],
          },
          {
            type: "Section",
            label: "Section2",
            fields: [
              { label: "text", field: "richtextfield", type: "richtext" },
            ],
          },
        ]}
      />
    </div>
  );
};
