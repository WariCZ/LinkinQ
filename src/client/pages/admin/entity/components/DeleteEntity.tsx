import { ModalPropsType } from "../../../../types/common/ModalPropsType";
import useStore from "../../../../store";
import { httpRequest } from "../../../../services/httpBase";
import Form from "../../../../components/DynamicForm";
import { useTranslation } from "react-i18next";

export const DeleteEntity = (props: { entity: string } & ModalPropsType) => {
  const { t } = useTranslation("entity");
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
            setError("entity", { message: t("toasts.erros.namesAreNotEqual") });
          }
        }
      }}
      formFields={[
        {
          label: t("labels.writeEntityName"),
          field: "entity",
          required: true,
          type: "text",
        },
      ]}
      formRef={props.formRef}
    />
  );
};
