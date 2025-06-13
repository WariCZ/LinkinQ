import { TextInput } from "flowbite-react";
import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { FieldType } from "../../../lib/entity/types";
import { useModalStore } from "../Modal/modalStore";
import { SelectLinkField } from "./components/SelectLinkField";
import { getFieldName } from "../../utils";

interface FieldSelectorProps {
  fields: FieldType[];
  onAdd?: (field: FieldType) => void;
  usedFields?: Set<string>;
  allowNested?: boolean;
}

export const FieldSelector = ({
  fields,
  onAdd,
  usedFields,
  allowNested = true,
}: FieldSelectorProps) => {
  const { openModal, closeModal } = useModalStore();
  const [search, setSearch] = useState("");

  const availableFields = fields.filter(
    (f) =>
      !usedFields?.has(f.name || "") &&
      (f.label?.toLowerCase().includes(search.toLowerCase()) ?? true)
  );

  const handleAddClick = (
    field: FieldType,
    path: string[] = [],
    labelParts: string[] = []
  ) => {
    const isLink = field.type.startsWith("link(");
    const entityName = isLink ? field.type.slice(5, -1) : null;

    const newPath = [...path, field.name ?? ""];
    const newLabelParts = [...labelParts, field.label ?? ""];

    if (isLink && entityName && allowNested) {
      openModal(
        <SelectLinkField
          entityName={entityName}
          usedFields={usedFields}
          onSelect={(targetField) => {
            const fullName = [...newPath, getFieldName(targetField)].join(".");

            if (targetField.type.startsWith("link(")) {
              handleAddClick(targetField, newPath, newLabelParts);
            } else {
              onAdd?.({
                ...targetField,
                name: fullName,
                label: targetField.label ?? "",
              });
            }

            closeModal();
          }}
        />,
        {
          modalSingle: false,
          title: `Select a field from "${entityName}"`,
          hideSuccessButton: true,
        }
      );
    } else {
      onAdd?.({
        ...field,
        name: newPath.join("."),
        label: field.label ?? "",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <TextInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
        placeholder="Search..."
      />
      {availableFields.map((field) => (
        <button
          key={field.name}
          className="border rounded px-3 py-2 hover:bg-blue-50 text-left w-full"
          onClick={() => handleAddClick(field)}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{field.label}</div>
              <div className="text-sm text-gray-500">{field.description}</div>
            </div>
            {allowNested &&
              (field.type.startsWith("link(") ||
                field.type.startsWith("nlink(")) && (
                <FiArrowRight className="text-gray-400 text-lg" />
              )}
          </div>
        </button>
      ))}
    </div>
  );
};
