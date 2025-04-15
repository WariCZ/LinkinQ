import Form from "../../../../../client/components/DynamicForm";
import { ModalPropsType } from "../../../../../client/types/common/ModalPropsType";
import useStore from "../../../../../client/store";
import { httpRequest } from "../../../../../client/services/httpBase";

export const AddEntity = (props: ModalPropsType) => {
  const getSchema = useStore((state) => state.getSchema);
  return (
    <Form
      onSubmit={async ({ data }) => {
        await httpRequest({
          url: "/api/entity",
          method: "POST",
          entity: "",
          data: {
            entity: data.entity,
          },
        });
        getSchema();
        props.closeModal && props.closeModal();
      }}
      formFields={[
        {
          label: "Entity",
          field: "entity",
          required: true,
          type: "text",
        },
      ]}
      {...props}
    />
  );
};
