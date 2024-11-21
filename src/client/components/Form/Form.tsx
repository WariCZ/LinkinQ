import React, { useEffect } from "react";
import {
  useForm,
  Controller,
  UseFormSetError,
  Control,
  FieldValues,
} from "react-hook-form";
import {
  Button,
  Textarea,
  Checkbox,
  Radio,
  Select,
  Label,
  TextInput,
  TextInputProps,
} from "flowbite-react";
import useStore from "../../store";
import { EntitySchema, EntityType, FieldType } from "@/lib/entity/types";
import _, { debounce } from "lodash";

type FormFieldDefault = {
  label?: string;
  field?: string;
  readOnly?: boolean;
  disabled?: boolean;
  id?: string;
  required?: boolean;
  default?: string;
  conditional?: {
    hide: string;
  };
  colSpan?: number;
};

type FormFieldSelect = {
  type: "select";
  options: { key: string | number; label: string }[];
} & FormFieldDefault;

type FormFieldText = {
  type: "text";
} & FormFieldDefault &
  TextInputProps &
  React.RefAttributes<HTMLInputElement>;

type Section = {
  type: "Section";
  label?: string;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  fields: (FormFieldType | Section)[];
  colSpan?: number;
};

type FormFieldType =
  | {
      id?: string;
      field: string;
      label?: string;
      description?: string;
      default?: string;
      conditional?: {
        hide: string;
      };
      type?: // | "text"
      | "textarea"
        | "number"
        | "datetime"
        | "Filepicker"
        | "checkbox"
        | "radiobutton"
        | "group"
        | "separator";
      readOnly?: boolean;
      disabled?: boolean;
      required?: boolean;
    }
  | FormFieldSelect
  | FormFieldText
  | Section;

interface DynamicFormProps {
  formFields: (FormFieldType | string)[];
  onSubmit?: (props: {
    closeModal?: () => void;
    data: Record<string, any>;
    setError: UseFormSetError<any>;
  }) => void;
  formRef?: React.LegacyRef<HTMLFormElement>;
  closeModal?: () => void;
  entity?: string;
  data?: Record<string, any>;
  disabled?: boolean;
  columns?: number;
  gap?: number;
}

const translateSchemaToForm = (
  fields: (FormFieldType | string)[],
  schema?: EntityType
): FormFieldType[] => {
  return fields.map((field: FormFieldType | string, i) => {
    let f: FormFieldType;
    if (typeof field == "string") {
      const s = schema?.fields[field];
      f = {
        field: field,
        label: s?.label || "",
        required: s?.isRequired,
        default: s?.default,
        type: "text",
      };
    } else {
      const s = schema?.fields[field.field];
      f = {
        field: field.field,
        label: field.label || s?.label || "",
        required: field.required || s?.isRequired,
        default: field.default || s?.default,
        type: "text",
      };
    }
    return f;
  });
};

const Form = ({
  formFields,
  onSubmit,
  formRef,
  closeModal,
  entity,
  data,
  disabled,
  columns,
  gap,
}: DynamicFormProps) => {
  const schema: any = useStore((state) => state.schema);

  const formSchema = entity
    ? translateSchemaToForm(formFields, entity && schema[entity])
    : (formFields as FormFieldType[]);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ disabled: disabled });

  useEffect(() => {
    reset(data);
  }, [reset, data]);

  const formSubmit = (formdata: any, e: any) => {
    //TODO: Spatne nemohu mazat prazdne hodnoty pokud uzivatel smaze hodnoty musi se to vyreset nejak jinak

    const data = _.pickBy(formdata, (value) => value !== null && value !== "");
    onSubmit &&
      onSubmit({
        data,
        closeModal,
        setError,
      });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(formSubmit)}
      className={columns && `grid grid-cols-${columns} gap-${gap || 2}`}
    >
      {formSchema.map((item, index) =>
        renderItem({ item, key: index, control, gap })
      )}
      <Button type="submit">Odeslat</Button>
    </form>
  );
};

const renderItem = ({
  item,
  key,
  control,
  gap,
}: {
  item: FormFieldType | Section;
  key: number;
  control: Control<FieldValues, any>;
  gap?: number;
}): React.ReactNode => {
  if (item.type === "Section") {
    return <FormSection key={key} section={item} control={control} gap={gap} />;
  }
  return <FormField key={key} formField={item} control={control} />;
};

const FormSection = ({
  section,
  control,
  gap,
}: {
  section: Section;
  control: Control<FieldValues, any>;
  gap?: number;
}) => {
  return (
    <div
      className={
        (section.colSpan && `col-span-${section.colSpan}`) +
        ` grid grid-cols-${section.columns || 1} gap-${gap || 2}`
      }
    >
      {section.label && <h3 className="col-span-full">{section.label}</h3>}
      {section.fields.map((field, index) =>
        renderItem({ item: field, key: index, control: control })
      )}
    </div>
  );
};

const FormField = ({
  formField,
  control,
}: {
  formField: FormFieldType;
  control: Control<FieldValues, any>;
}) => {
  if (!formField.type) formField.type = "text";
  switch (formField.type) {
    case "text":
      return (
        <div
          key={formField.field}
          className={formField.colSpan && `col-span-${formField.colSpan}`}
        >
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={formField.default || ""}
            rules={{ required: formField.required }}
            render={({ field }) => (
              <TextInput
                {...field}
                {...formField}
                type="text"
                disabled={formField.disabled}
                readOnly={formField.readOnly}
                required={formField.required}
              />
            )}
          />
        </div>
      );

    case "textarea":
      return (
        <div key={formField.field}>
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={formField.default || ""}
            rules={{ required: formField.required }}
            render={({ field }) => (
              <Textarea
                {...field}
                id={formField.field}
                disabled={formField.disabled}
                readOnly={formField.readOnly}
              />
            )}
          />
        </div>
      );

    case "number":
      return (
        <div key={formField.field}>
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={formField.default || ""}
            rules={{ required: formField.required }}
            render={({ field }) => (
              <TextInput
                {...field}
                id={formField.field}
                type="number"
                disabled={formField.disabled}
                readOnly={formField.readOnly}
              />
            )}
          />
        </div>
      );

    case "checkbox":
      return (
        <div key={formField.field}>
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={false}
            rules={{ required: formField.required }}
            render={({ field }) => (
              <Checkbox
                {...field}
                id={formField.field}
                disabled={formField.disabled}
              />
            )}
          />
        </div>
      );

    case "radiobutton":
      return (
        <div key={formField.field}>
          <Label>{formField.label}</Label>
          {formField.description?.split(",").map((option) => (
            <Controller
              key={option}
              name={formField.field}
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Radio
                  {...field}
                  value={option}
                  id={`${formField.field}-${option}`}
                  disabled={formField.disabled}
                />
              )}
            />
          ))}
        </div>
      );

    case "select":
      return (
        <div key={formField.field} className="test">
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue=""
            rules={{ required: formField.required }}
            render={({ field }) => (
              <Select
                {...field}
                id={formField.field}
                disabled={formField.disabled}
              >
                <option value="" disabled>
                  Select an option
                </option>
                {formField.options.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </div>
      );

    // Add other cases (datetime, Filepicker, etc.) as needed.

    default:
      console.warn(`Form formField type ${formField.type} is not defined`);
      return null;
  }
};

export default Form;
