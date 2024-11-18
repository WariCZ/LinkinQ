import React, { useEffect } from "react";
import { useForm, Controller, UseFormSetError } from "react-hook-form";
import {
  Button,
  TextInput,
  Textarea,
  Checkbox,
  Radio,
  Select,
  Label,
} from "flowbite-react";
import useStore from "../../store";
import { EntitySchema, EntityType, FieldType } from "@/lib/entity/types";
import _ from "lodash";

type FormField = {
  id?: string;
  field: string;
  label?: string;
  description?: string;
  default?: string;
  conditional?: {
    hide: string;
  };
  type?:
    | "textformField"
    | "textarea"
    | "number"
    | "datetime"
    | "Filepicker"
    | "checkbox"
    | "radiobutton"
    | "select"
    | "group"
    | "separator";
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
};

interface DynamicFormProps {
  formFields: (FormField | string)[];
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
}

const translateSchemaToForm = (
  fields: (FormField | string)[],
  schema?: EntityType
): FormField[] => {
  return fields.map((field: FormField | string, i) => {
    let f: FormField;
    if (typeof field == "string") {
      const s = schema?.fields[field];
      f = {
        field: field,
        label: s?.label || "",
        required: s?.isRequired,
        default: s?.default,
        type: "textformField",
      };
    } else {
      const s = schema?.fields[field.field];
      f = {
        field: field.field,
        label: field.label || s?.label || "",
        required: field.required || s?.isRequired,
        default: field.default || s?.default,
        type: "textformField",
      };
    }
    return f;
  });
};

const Form: React.FC<DynamicFormProps> = ({
  formFields,
  onSubmit,
  formRef,
  closeModal,
  entity,
  data,
  disabled,
}) => {
  const schema: any = useStore((state) => state.schema);

  const formSchema = translateSchemaToForm(
    formFields,
    entity && schema[entity]
  );
  console.log("formSchema", formSchema);
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

  const removeUndefined = (obj: Record<string, any>) => {
    return Object.entries(obj).reduce((acc: any, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    });
  };

  // const isFieldHidden = (formField: FormField) => {
  //   return formField.conditional?.hide
  //     ? watchAllFields[formField.conditional.hide]
  //     : false;
  // };
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
    <form ref={formRef} onSubmit={handleSubmit(formSubmit)}>
      {formSchema.map((formField) => {
        // if (isFieldHidden(formField)) return null; // Conditionally hide formFields
        if (disabled) {
          formField.disabled = true;
        }
        switch (formField.type) {
          case "textformField":
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
                      type="text"
                      disabled={formField.disabled}
                      readOnly={formField.readonly}
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
                      readOnly={formField.readonly}
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
                      readOnly={formField.readonly}
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
              <div key={formField.field}>
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
                      {formField.description?.split(",").map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </div>
            );

          // Add other cases (datetime, Filepicker, etc.) as needed.

          default:
            console.warn(
              `Form formField type ${formField.type} is not defined`
            );
            return null;
        }
      })}
    </form>
  );
};

export default Form;
