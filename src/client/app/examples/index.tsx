import { useModalStore } from "../../../client/components/Modal/modalStore";
import { Button } from "flowbite-react";
import React from "react";
import { ManualTask } from "./components/ManualTask";
import { FaDownload, FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export const Examples = () => {
  const { t } = useTranslation();
  const { openModal } = useModalStore();
  const entity = "tasks";

  return (
    <>
      <Button
        onClick={() =>
          openModal(<ManualTask entity={entity} />, {
            title: "Manual Task",
            size: "7xl",
            modalSingle: true,
            additionalButtons: [
              {
                label: t("labels.apply"),
                onClick: () => console.log("Click"),
                color: "cyan",
                icon: FaDownload,
              },
            ],
          })
        }
      >
        <FaPlus className="ml-0 m-1 h-3 w-3" />
        {t("labels.addManualTask")}
      </Button>
    </>
  );
};
