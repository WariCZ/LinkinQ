import { useModalStore } from "@/client/components/Modal/modalStore";
import useStore from "@/client/store";
import { FieldType } from "@/lib/entity/types";
import { FiArrowRight } from "react-icons/fi";
import { getFieldName } from "../../utils/getFieldName";

type SelectLinkFieldProps = {
  entityName: string;
  usedFields?: Set<string>;
  onSelect: (field: FieldType) => void;
};

export const SelectLinkField = ({
  entityName,
  onSelect,
  usedFields,
}: SelectLinkFieldProps) => {
  const schema = useStore((state) => state.schema);
  const fields = Object.values(schema[entityName]?.fields ?? {});
  const { openModal, closeModal } = useModalStore();

  const handleSelect = (field: FieldType, pathPrefix = "") => {
    const isLink = field.type.startsWith("link(");
    const nestedEntity = isLink ? field.type.slice(5, -1) : null;
    const newPrefix = [pathPrefix, field.name].filter(Boolean).join(".");

    if (isLink && nestedEntity) {
      openModal(
        <SelectLinkField
          entityName={nestedEntity}
          usedFields={usedFields}
          onSelect={(nestedField) => {
            const newField = {
              ...nestedField,
              name: [newPrefix, getFieldName(nestedField)]
                .filter(Boolean)
                .join("."),
              label: nestedField.label,
            };
            closeModal();
            onSelect(newField);
          }}
        />,
        {
          title: `Choose nested field from "${nestedEntity}"`,
          hideSuccessButton: true,
        }
      );
    } else {
      onSelect(field);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      {fields.map((field) => (
        <button
          key={field.name}
          className="border rounded px-3 py-2 hover:bg-blue-50 text-left w-full"
          onClick={() => handleSelect(field, field.name)}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{field.label}</div>
              <div className="text-sm text-gray-500">{field.description}</div>
              <div className="text-sm text-gray-500">{field.type}</div>
            </div>
            {field.type.startsWith("link(") && (
              <FiArrowRight className="text-gray-400 text-lg" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
