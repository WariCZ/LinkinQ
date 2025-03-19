import { useModalStore } from "@/client/components/Modal/modalStore";
import { Button } from "flowbite-react";
import React from "react";
import { ManualTask } from "./components/ManualTask";
import { FaDownload, FaPlus } from "react-icons/fa";

export const Examples = () => {
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
              { label: "Aplikovat", onClick: () => console.log("Click"), color: "cyan", icon: FaDownload, }
            ]
          })
        }
      >
        <FaPlus className="ml-0 m-1 h-3 w-3" />
        Add Manual Task
      </Button>
    </>
  );
};
