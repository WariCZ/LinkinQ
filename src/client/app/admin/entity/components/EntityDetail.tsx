import { useModalStore } from "../../../../../client/components/Modal/modalStore";
import { exportJsonFile } from "../../../../../client/utils";
import { EntityType } from "../../../../../lib/entity/types";
import { Button } from "flowbite-react";
import { FieldDetail } from "./FieldDetail";
import { DeleteEntity } from "./DeleteEntity";
import { FaFileExport, FaPlus } from "react-icons/fa";
import Table from "../../../../../client/components/Table";
import { AppButton } from "../../../../../client/components/common/AppButton";

export const EntityDetail = ({
  entity,
  definition,
}: {
  entity?: string;
  definition?: EntityType;
}) => {
  const { openModal } = useModalStore();
  const fieldsArray = definition?.fields
    ? Object.entries(definition?.fields).map(([key, value]) => ({
        name: key,
        ...value,
      }))
    : [];

  const exportEntity = () => {
    exportJsonFile({
      json: { [entity]: definition },
      filename: entity,
    });
  };

  if (!entity) return <div className="p-2 w-[65vw]">Not selected</div>;

  return (
    <div className="p-2 w-full overflow-auto">
      <div className="flex w-full">
        <span className="pr-2">Entity:</span>
        <span className="font-bold pr-2">{entity}</span>
        <AppButton
          icon={<FaPlus />}
          onClick={() => {
            openModal(<FieldDetail entity={entity} />, {
              title: "Add new field",
            });
          }}
          size={"xs"}
        >
          Add Field
        </AppButton>
        <span className="ml-auto"></span>
        <span className="ml-auto">
          <FaFileExport
            className="inline-block mx-2 cursor-pointer"
            onClick={exportEntity}
          />
          <Button
            className="inline-block"
            disabled={definition?.system}
            color="failure"
            onClick={() => {
              openModal(<DeleteEntity entity={entity} />, {
                title: "Delete entity",
              });
            }}
            size="xs"
          >
            Delete Entity
          </Button>
        </span>
      </div>
      <div className="pt-1">
        <Table
          tableConfigKey="entity"
          data={fieldsArray}
          rowClick={(data) =>
            openModal(<FieldDetail data={data} entity={entity} />)
          }
          columns={[
            { field: "name", className: "font-bold" },
            "type",
            "label",
            "description",
            "default",
          ]}
          // loading={loading}
          // ordering={[{ id: "name" }]}
        />
      </div>
    </div>
  );
};
