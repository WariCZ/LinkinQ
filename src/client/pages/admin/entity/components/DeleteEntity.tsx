import { ModalPropsType } from "../../../../types/common/ModalPropsType";
import useStore from "../../../../store";
import { httpRequest } from "../../../../services/httpBase";
import Form from "../../../../components/DynamicForm";

export const DeleteEntity = (props: { entity: string } & ModalPropsType) => {
  const getSchema = useStore((state) => state.getSchema);
  return (
    <Form
      onSubmit={async ({ data, setError }) => {
        if (data.entity) {
          if (data.entity === props.entity) {
            await httpRequest({
              url: "/api/entity",
              method: "DELETE",
              entity: "",
              data: {
                entity: data.entity,
              },
            });
            getSchema();
            props.closeModal && props.closeModal();
          } else {
            setError("entity", { message: "Názvy nejsou stejné" });
          }
        }
      }}
      formFields={[
        {
          label: "Write entity name",
          field: "entity",
          required: true,
          type: "text",
        },
      ]}
      formRef={props.formRef}
    />
  );
};
