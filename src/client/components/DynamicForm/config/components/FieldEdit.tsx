import { useForm } from "react-hook-form";
import { Checkbox, Label, TextInput } from "flowbite-react";
import { FormFieldType } from "../../../../../client/types/DynamicForm/types";
import { useEffect } from "react";

const EDITABLE_FIELDS: (keyof FormFieldType)[] = [
  "label",
  "required",
  "readOnly",
];

type Props = {
  field: FormFieldType;
  onChange: (data: Partial<FormFieldType>) => void;
};

export const FieldEdit = ({ field, onChange }: Props) => {
  const { register, watch } = useForm({
    defaultValues: field as any,
  });

  const watchedValues = watch();

  useEffect(() => {
    onChange(watchedValues);
  }, [watchedValues]);

  return (
    <form className="space-y-4 p-4">
      {Object.entries(field).map(([key, value]) => {
        if (key === "required" || key === "readOnly" || key === "colSpan")
          return null;

        const isBoolean = typeof value === "boolean";
        const isEditable = EDITABLE_FIELDS.includes(key as keyof FormFieldType);

        return isBoolean ? (
          <div key={key} className="flex items-center gap-2">
            <Checkbox id={key} {...register(key)} disabled={!isEditable} />
            <Label htmlFor={key}>{key}</Label>
          </div>
        ) : (
          <div key={key}>
            <Label htmlFor={key} value={key} />
            <TextInput id={key} {...register(key)} disabled={!isEditable} />
          </div>
        );
      })}

      <div className="pt-4 border-t border-gray-200 flex justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id="required" {...register("required")} />
          <Label htmlFor="required">Required</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="readOnly" {...register("readOnly")} />
          <Label htmlFor="readOnly">Read Only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="colSpan">Column Span</Label>
          <select
            id="colSpan"
            {...register("colSpan")}
            className="border rounded px-2 py-1"
          >
            {[1, 2, 3, 4, 6, 12].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
};
