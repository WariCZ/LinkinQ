import { Control, FieldValues } from "react-hook-form";
import { FormFieldType, SectionType } from "../../../types/DynamicForm/types";
import { EntityType } from "@/lib/entity/types";
import { renderItem, translateFormField } from "../utils/FormUtils";

export const FormSection = ({
  section,
  control,
  schema,
  readOnly,
}: {
  section: SectionType;
  control: Control<FieldValues, any>;
  schema?: EntityType;
  readOnly?: boolean;
}) => {
  return (
    <div
      className={`grid gap-4 items-center ${section.className || ""} ${
        section.columns ? `grid-cols-${section.columns}` : ""
      }`}
    >
      {section.label && <h3 className="col-span-full">{section.label}</h3>}
      {section.fields.map((field, index) => {
        let formField: FormFieldType = translateFormField({
          schema: schema,
          field: field,
        });
        return renderItem({
          formField,
          key: index,
          control: control,
          schema,
          readOnly,
        });
      })}
    </div>
  );
};
