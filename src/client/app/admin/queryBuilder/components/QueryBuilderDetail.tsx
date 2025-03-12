import Form from "@/client/components/DynamicForm";
import { FormFieldType } from "@/client/types/DynamicForm/types";
import { ModalPropsType } from "@/client/types/common/ModalPropsType";
import useDataDetail from "@/client/hooks/useDataDetail";
import useStore from "@/client/store";

export const QueryBuilderDetail = (
  props: { entity: string; data?: any; refresh: any } & ModalPropsType
) => {
  const entity = props.entity;
  const schema = useStore((state) => state.schema);
  console.log("ss", schema[entity]);
  const fields = Object.keys(schema[entity].fields);

  const [data, setData, { setRecord, loading, refresh }] = useDataDetail(
    {
      entity: entity,
      guid: props?.data?.guid,
      fields: fields,
    },
    {} as any
  );

  return (
    <>
      <Form
        onSubmit={async ({ data }) => {
          await setRecord(data);
          props.refresh();
          props.closeModal && props.closeModal();
        }}
        {...props}
        data={data}
        entity={entity}
        formFields={fields.map((f): FormFieldType => {
          const field = schema[entity].fields[f];
          const fieldObj: any = {
            field: f,
            label: field.label,
            entity: field.link,
            isMulti: field.nlinkTable ? true : false,
            required: field.isRequired,
            default: field.default,
            visible: ["id"].indexOf(f) == -1,
            type: field.link ? "select" : "text",
          };

          if (
            [
              "guid",
              "id",
              "lockedby",
              "createtime",
              "createdby",
              "updatedby",
              "updatetime",
              "status",
              "workflowInstance",
            ].indexOf(f) > -1
          ) {
            fieldObj.readOnly = true;
            fieldObj.required = false;
          }
          if (f == "workflowInstance") {
            fieldObj.labelFields = "name";
          }

          return fieldObj;
        })}
      />
    </>
  );
};
