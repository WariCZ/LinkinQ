import { Button } from "flowbite-react";
import { useModalStore } from "../../Modal/modalStore";
import {
  FormFieldType,
  SectionType,
} from "../../../../client/types/DynamicForm/types";
import { FieldPrimitiveType, FieldType } from "../../../../lib/entity/types";
import { AddField } from "../../DynamicForm/config/components/AddField";
import { useState } from "react";

type AddAttributesModalProps = {
  fields: FieldType[];
  usedFields?: Set<string>;
  onAdd?: (field: FormFieldType[]) => void;
};

export const AddAttributesModal = ({
  fields,
  onAdd,
}: AddAttributesModalProps) => {
  const { openModal, closeModal } = useModalStore();
  const [attributes, setAttributes] = useState<FormFieldType[] | []>([]);
  function mapFieldPrimitiveToFormType(
    type: FieldPrimitiveType
  ): FormFieldType["type"] {
    if (type.startsWith("link(")) return "select";
    if (type === "boolean") return "checkbox";
    if (type === "integer" || type === "bigint") return "number";
    if (type === "datetime") return "datetime";
    if (type === "password") return "password";
    if (type === "richtext") return "richtext";
    return "text";
  }

  return (
    <Button
      color="alternative"
      onClick={() =>
        openModal(
          <AddField
            fields={fields}
            onAdd={(field) => {
              const newField = {
                type: mapFieldPrimitiveToFormType(field.type),
                name: field.name,
                field: field.name,
                label: field.label,
                required: field.isRequired ?? false,
                visible: true,
              } as FormFieldType;

              const updated = [...attributes];

              let lastSection = [...updated]
                .reverse()
                .find(
                  (f): f is SectionType =>
                    f.type === "Section" && Array.isArray((f as any).fields)
                );

              if (!lastSection) {
                lastSection = {
                  type: "Section",
                  label: "Nová sekce",
                  fields: [],
                };
                updated.push(lastSection);
              }

              lastSection.fields.push(newField);

              const result = [...updated];
              setAttributes(result);

              if (onAdd) onAdd(result);

              closeModal();
            }}
          />,
          {
            title: "Přidat pole",
            size: "xl",
            hideSuccessButton: true,
          }
        )
      }
    >
      Add field +
    </Button>
  );
};
