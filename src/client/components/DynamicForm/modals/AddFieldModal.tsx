import { Button } from "flowbite-react";
import { useModalStore } from "../../Modal/modalStore";
import { AddField } from "../config/components/AddField";
import {
  FormFieldType,
  SectionType,
} from "../../../../client/types/DynamicForm/types";
import { FieldPrimitiveType, FieldType } from "../../../../lib/entity/types";
import { useFormConfigStore } from "../_store";

type AddFieldModalProps = {
  fields: FieldType[];
};

export const AddFieldModal = ({ fields }: AddFieldModalProps) => {
  const { localFields, setLocalFields } = useFormConfigStore();
  const { openModal, closeModal } = useModalStore();

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

              const updated = [...localFields];

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

              setLocalFields([...updated]);
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
