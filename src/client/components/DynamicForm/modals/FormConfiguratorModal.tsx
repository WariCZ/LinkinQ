import { useModalStore } from "../../Modal/modalStore";
import { FaEdit } from "react-icons/fa";
import { Button } from "flowbite-react";
import { FieldType } from "../../../../lib/entity/types";
import { FormConfigurator } from "../config";
import { useFormConfigManager } from "../hooks/useFormConfigManager";

export const FormConfiguratorModal = ({ fields, tableConfigKey }: { fields: FieldType[], tableConfigKey?: string }) => {
  const { saveFormLayout } = useFormConfigManager(tableConfigKey);
  const { openModal, closeModal } = useModalStore();

  return (
    <Button
      className="ml-auto"
      color="alternative"
      onClick={() => {
        openModal(<FormConfigurator fields={fields} />, {
          title: "Customizing the form view",
          size: "7xl",
          modalSingle: false,
          hideSuccessButton: true,
          additionalButtons: [
            {
              label: "Apply",
              onClick: () => {
                saveFormLayout();
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
