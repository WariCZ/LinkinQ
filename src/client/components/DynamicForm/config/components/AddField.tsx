import { useModalStore } from "../../../../components/Modal/modalStore";
import { FieldType } from "../../../../../lib/entity/types";
import { TextInput } from "flowbite-react";
import { useState } from "react";
import { SelectLinkField } from "./SelectLinkField";
import { FiArrowRight } from "react-icons/fi";
import { getFieldName } from "../../utils/getFieldName";

interface AddFieldProps {
  fields: FieldType[];
  onAdd?: (field: FieldType) => void;
  usedFields?: Set<string>;
}

export const AddField = ({ fields, onAdd, usedFields }: AddFieldProps) => {
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

    if (isLink && entityName) {
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
      {availableFields.map((field, index) => (
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
            {field.type.startsWith("link(") && (
              <FiArrowRight className="text-gray-400 text-lg" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
