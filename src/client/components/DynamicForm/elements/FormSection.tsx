import { Control, FieldValues } from "react-hook-form";
import { FormFieldType, SectionType } from "../../../types/DynamicForm/types";
import { EntityType } from "@/lib/entity/types";
import { renderItem, translateFormField } from "../utils/FormUtils";

export const FormSection = ({
  section,
  control,
  gap,
  schema,
}: {
  section: SectionType;
  control: Control<FieldValues, any>;
  gap?: number;
  schema?: EntityType;
}) => {
  return (
    <div
      className={
        (section.colSpan && `lg:col-span-${section.colSpan}`) +
        ` grid lg:grid-cols-${section.columns || 1} gap-${gap || 2}`
      }
    >
      {section.label && <h3 className="col-span-full">{section.label}</h3>}
      {section.fields.map((field, index) => {
        let formField: FormFieldType = translateFormField({
          schema: schema,
          field: field,
        });

        return renderItem({ formField, key: index, control: control, schema });
      })}
    </div>
  );
};