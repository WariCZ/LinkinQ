import { useModalStore } from "../../Modal/modalStore";
import useStore from "../../../store";
import { FieldType } from "../../../../lib/entity/types";
import { FiArrowRight } from "react-icons/fi";

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
  const fields = Object.entries(schema[entityName]?.fields ?? {}).map(
    ([name, meta]) => ({ ...meta, name })
  );
  const { openModal, closeModal } = useModalStore();

  const handleSelect = (field: FieldType, pathPrefix = "") => {
    const isLink =
      field.type.startsWith("link(") || field.type.startsWith("nlink(");
    const linkedEntity = field.type.match(/\(([^)]+)\)/)?.[1];
    const newPrefix = pathPrefix
      ? `${pathPrefix}.${field.name}`
      : field.name ?? "";

    if (isLink && linkedEntity) {
      openModal(
        <SelectLinkField
          entityName={linkedEntity}
          usedFields={usedFields}
          onSelect={(nestedField) => {
            const newField = {
              ...nestedField,
              name: `${newPrefix}.${nestedField.name}`,
              label: nestedField.label,
            };
            closeModal();
            onSelect(newField);
          }}
        />,
        {
          modalSingle: false,
          title: `Select a field from "${field.label ?? linkedEntity}"`,
          hideSuccessButton: true,
        }
      );
    } else {
      onSelect({ ...field, name: newPrefix });
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      {fields.map((field) => (
        <button
          key={field.name}
          className="border rounded px-3 py-2 hover:bg-blue-50 text-left w-full"
          onClick={() => handleSelect(field, "")}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{field.label}</div>
              <div className="text-sm text-gray-500">{field.description}</div>
              <div className="text-sm text-gray-500">Type: {field.type}</div>
              <div className="text-sm text-gray-500">Name: {field.name}</div>
            </div>
            {(field.type.startsWith("link(") ||
              field.type.startsWith("nlink(")) && (
              <FiArrowRight className="text-gray-400 text-lg" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
