import { ModalPropsType } from "../../../types/common/ModalPropsType";
import Form from "../../../../client/components/DynamicForm";

export const SettingsWorkflow = (
  props: ModalPropsType & {
    setSettings: (data: any) => void;
    defaultValues?: {
      filter: string;
      default: boolean;
    };
  }
) => {
  return (
    <Form
      onSubmit={async ({ data }) => {
        props.setSettings({
          filter: data.filter,
          default: data.default,
        });
        props.closeModal && props.closeModal();
      }}
      data={props.defaultValues}
      formFields={[
        {
          label: "Entity",
          field: "entity",
          type: "text",
          disabled: true,
        },
        {
          label: "Filter",
          field: "filter",
          type: "text",
        },
        {
          label: "Default",
          field: "default",
          type: "switch",
        },
      ]}
      {...props}
    />
  );
};
