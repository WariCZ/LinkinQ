import Form from "../../../../components/DynamicForm";
import { FormFieldType } from "../../../../types/DynamicForm/types";
import { ModalPropsType } from "../../../../types/common/ModalPropsType";
import useDataDetail from "../../../../hooks/useDataDetail";
import useStore from "../../../../store";
import { Spinner } from "flowbite-react";

const getFormFields = ({ fields, schema, entity }) => {
  return fields.map((f): FormFieldType => {
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
      className: "inline",
    };

    if (field.type === "richtext") {
      fieldObj.type = "richtext";
    }
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
  });
};
export const QueryBuilderDetail = (
  props: { entity: string; data?: any; refresh: any } & ModalPropsType
) => {
  const entity = props.entity;
  const schema = useStore((state) => state.schema);
  // const fields = Object.keys(schema[entity].fields);

  const systemFields = [];
  const nonSystemFields = [];

  for (const [key, value] of Object.entries(schema[entity].fields)) {
    if (value.system === true) {
      systemFields.push(key);
    } else {
      nonSystemFields.push(key);
    }
  }

  const fields: FormFieldType[] = [
    {
      type: "CollapsibleSection",
      label: "System",
      children: getFormFields({ fields: systemFields, entity, schema }),
    },
    {
      type: "CollapsibleSection",
      label: "Others",
      children: getFormFields({ fields: nonSystemFields, entity, schema }),
    },
  ];

  console.log("QueryBuilderDetail props", props);
  const [data, setData, { setRecord, loading, refresh }] = useDataDetail(
    {
      entity: entity,
      guid: props?.data?.guid,
      // fields: *"",
    },
    {} as any
  );
  //

  if (loading) {
    return (
      <div>
        <Spinner></Spinner>
      </div>
    );
  }

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
        formFields={fields}
      />
    </>
  );
};
