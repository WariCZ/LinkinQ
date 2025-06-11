import useStore from "../../../store";
import { Button, Label } from "flowbite-react";
import DynamicForm from "../../DynamicForm";
import { FormFieldType } from "../../../types/DynamicForm/types";
import { useModalStore } from "../../Modal/modalStore";
import { AddField } from "../../DynamicForm/config/components/AddField";
import { FieldType } from "../../../../lib/entity/types";
import { FaPlus } from "react-icons/fa";
import { AppButton } from "../../common/AppButton";
import { MdDelete } from "react-icons/md";

interface AttributesSettingsProps {
  entity: string;
  attributes: Record<string, string>;
  onChange: (data: Record<string, any>) => void;
  setAttributes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedTask: any;
  fields: FormFieldType[];
  removeAttribute: any;
}

export function AttributesSettings({
  entity,
  attributes,
  onChange,
  setAttributes,
  selectedTask,
  fields,
  removeAttribute,
}: AttributesSettingsProps) {
  const schema = useStore((state) => state.schema);
  const { openModal, closeModal } = useModalStore();

  const availableFields: FieldType[] = Object.entries(
    schema?.[entity]?.fields || {}
  ).map(([name, meta]) => ({
    ...meta,
    name,
  }));

  return (
    <div className="mt-4">
      <div className="flex justify-between items-start">
        <Label className="block mb-2 text-xl">
          Edit Task Attributes: {selectedTask.id}
        </Label>
        <AppButton
          icon={<FaPlus />}
          onClick={() =>
            openModal(
              <AddField
                fields={availableFields}
                onAdd={(field) => {
                  const key = field.name ?? "";
                  if (!key) return;

                  setAttributes((prev) => ({
                    ...prev,
                    [key]: "",
                  }));

                  closeModal();
                }}
              />,
              {
                title: "Add attributes",
                size: "xl",
                hideSuccessButton: true,
              }
            )
          }
        >
          Add attributes
        </AppButton>
      </div>

      {fields.map((field) => (
        <div
          key={field.field}
          className="flex justify-end w-full gap-2 items-end"
        >
          <DynamicForm
            formFields={[{ ...field }]}
            data={{ [field.field]: attributes[field.field] }}
            entity={entity}
            onChange={({ data }) => onChange(data)}
            className="w-full"
          />

          <Button
            color="red"
            onClick={() => removeAttribute(field.field!)}
            className="mb-1"
          >
            <MdDelete />
          </Button>
        </div>
      ))}
    </div>
  );
}
