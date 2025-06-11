import Form from "../../../../components/DynamicForm";
import { ModalPropsType } from "../../../../types/common/ModalPropsType";
import useStore from "../../../../store";
import axios from "axios";
import { fieldFormTriggers } from "../utils/fieldFormTriggers";

export const AddTrigger = (props: { guid?: object } & ModalPropsType) => {
  const schema = useStore((state) => state.schema);
  return (
    <Form
      onSubmit={async ({ data }) => {
        await axios.post("/api/triggers", {
          ...data,
        });
        props.closeModal && props.closeModal();
      }}
      formFields={fieldFormTriggers(schema)}
      {...props}
    />
  );
};
