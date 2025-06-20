import { Control, FieldValues } from "react-hook-form";
import { FormFieldType, SectionType } from "../../../types/DynamicForm/types";
import { EntityType } from "../../../../lib/entity/types";
import { renderItem, translateFormField } from "../utils/FormUtils";
import { IconChevronRight, IconTag } from "../../Icons";
import { useState } from "react";

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
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{
        transition: !open
          ? "max-height 0.5s cubic-bezier(0, 1, 0, 1)"
          : "max-height 1s ease-in-out",
      }}
      className={`grid gap-4 items-center ${section.className || ""} ${
        section.columns ? `grid-cols-${section.columns}` : ""
      }  overflow-hidden ${open ? "max-h-[1000px]" : "max-h-[30px]"}`}
    >
      {section.label && (
        <h3
          className="col-span-full flex justify-between border-b-2 border-purple-900 cursor-pointer hover:bg-gray-50"
          onClick={() => setOpen(!open)}
        >
          <span className="flex items-center gap-3">
            {/* <IconTag size={15} /> */}
            <span className="text-base font-medium">{section.label}</span>
          </span>
          <IconChevronRight
            size={20}
            className={`transform transition-transform duration-300 ${
              open ? "rotate-90" : "rotate-0"
            }`}
          />
        </h3>
      )}
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
