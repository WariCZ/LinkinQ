import { ModalPropsType } from "@/client/types/common/ModalPropsType";
import useStore from "@/client/store";
import { httpRequest } from "@/client/hooks/useDataDetail";
import Form from "@/client/components/DynamicForm";

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
