import { useModalStore } from "../../Modal/modalStore";
import { FaEdit } from "react-icons/fa";
import { Button } from "flowbite-react";
import { FieldType } from "@/lib/entity/types";
import { useFormConfigStore } from "../_store";
import { FormConfigurator } from "../config";

export const FormConfiguratorModal = ({ fields }: { fields: FieldType[] }) => {
  const { saveConfig, resetLocalFields } = useFormConfigStore();
  const { openModal, closeModal } = useModalStore();

  return (
    <Button
      className="ml-auto"
      color="alternative"
      onClick={() => {
        resetLocalFields();
        openModal(<FormConfigurator fields={fields} />, {
          title: "Customizing the form view",
          size: "7xl",
          modalSingle: false,
          hideSuccessButton: true,
          additionalButtons: [
            {
              label: "Apply",
              onClick: () => {
                saveConfig();
                closeModal();
              },
            },
          ],
        });
      }}
    >
      <FaEdit />
    </Button>
  );
};
