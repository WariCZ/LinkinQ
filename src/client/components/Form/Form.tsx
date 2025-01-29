import React, { useEffect, useState } from "react";
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
  Label,
  TextInput,
  TextInputProps,
  Datepicker,
} from "flowbite-react";
import useStore from "../../store";
import { EntityType } from "@/lib/entity/types";
import _ from "lodash";
import Select from "./Select";
import { ConditionType, FormFieldType, SectionType } from "./types";
import DateTimePicker from "./Datetimepicker";
import FileUpload from "./FileUpload";

// export { FormFieldType };

interface DynamicFormProps {
  formFields: (FormFieldType | string)[];
  onSubmit?: (props: {
    data: Record<string, any>;
    setError: UseFormSetError<any>;
  }) => void;
  onChange?: (props: { data: Record<string, any> }) => void;
  formRef?: React.LegacyRef<HTMLFormElement>;
  entity?: string;
  data?: Record<string, any>;
  disabled?: boolean;
  columns?: number;
  gap?: number;
  children?: React.ReactElement;
}

const getFieldsForForm = (
  fields: (FormFieldType | string)[],
  schema?: EntityType
): (FormFieldType | string)[] => {
  return _.flatMapDeep(
    fields.map((field: FormFieldType | string, i) => {
      if (typeof field == "object" && field.type == "Section") {
        return getFieldsForForm(field.fields, schema);
      }
      return field;
    })
  );
};

const evaluateConditions = (
  conditions: ConditionType[],
  watchAllFields: any
) => {
  return conditions.some((cond) => {
    for (const key in cond) {
      if (watchAllFields[key] !== cond[key]) {
        return false;
      }
    }
    return true;
  });
};

const evaluateRules = (
  rules: FormFieldType["rules"],
  watchAllFields: Record<string, any>
) => {
  const result: { visible?: boolean; required?: boolean } = {};
  rules?.forEach((rule) => {
    const matchesConditions = evaluateConditions(
      rule.conditions,
      watchAllFields
    );

    switch (rule.type) {
      case "show":
        if (!matchesConditions) result.visible = false;
        break;
      case "hide":
        if (matchesConditions) result.visible = false;
        break;
      case "required":
        if (matchesConditions) result.required = true;
        break;
      case "optional":
        if (matchesConditions) result.required = false;
        break;
    }
  });

  return result;
};

const translateFormField = ({
  field,
  schema,
}: {
  field: FormFieldType | string;
  schema?: EntityType;
}): FormFieldType => {
  if (typeof field == "string") {
    const s = schema?.fields[field];

    if (s && s.link && s.link == "attachments") {
      return {
        field: field,
        label: s?.label || "",
        required: s?.isRequired,
        multi: s.nlinkTable ? true : false,
        type: "attachment",
      };
    } else if (s && s.link) {
      return {
        field: field,
        label: s?.label || "",
        required: s?.isRequired,
        default: s?.default,
        entity: s.link,
        isMulti: s.nlinkTable ? true : false,
        type: "select",
      };
    } else {
      return {
        field: field,
        label: s?.label || "",
        required: s?.isRequired,
        default: s?.default,
        type: "text",
      };
    }
  } else {
    if (field.type == "Section") {
      return field;
    }
    const s = schema?.fields[field.field];
    if (s && s.link && s.link == "attachments") {
      return {
        field: field.field,
        label: field.label || s?.label || "",
        required: field.required !== undefined ? field.required : s?.isRequired,
        multi: s.nlinkTable ? true : false,
        type: "attachment",
      };
    } else if (s && s.link) {
      return {
        ...field,
        field: field.field,
        label: field.label || s?.label || "",
        required: field.required !== undefined ? field.required : s?.isRequired,
        default: field.default || s?.default,
        entity: s.link,
        isMulti: s.nlinkTable ? true : false,
        type: "select",
      };
    } else {
      return {
        ...field,
        field: field.field,
        label: field.label || s?.label || "",
        required: field.required !== undefined ? field.required : s?.isRequired,
        default: field.default || s?.default,
        type: field.type || "text",
      };
    }
  }
};

const Form = ({
  formFields,
  onSubmit,
  onChange,
  formRef,
  entity,
  data,
  disabled,
  columns,
  gap,
  children,
}: DynamicFormProps) => {
  const schema: any = useStore((state) => state.schema);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    register,
    watch,
    formState: { errors },
  } = useForm({ disabled: disabled, defaultValues: {} });

  const watchAllFields = onChange ? watch() : null;

  useEffect(() => {
    if (!data || (data && Object.keys(data).length === 0)) {
      const resVal = formFields
        .map((ff) => {
          if (typeof ff === "string") {
            return ff;
          }
          if (ff.type !== "Section") {
            return ff?.field;
          }

          return undefined;
        })
        .filter((ff) => ff)
        .reduce((acc, key) => {
          acc[key] = "";
          return acc;
        }, {});

      reset(resVal);
    } else {
      reset(data);
    }
  }, [reset, data]);

  const findChanges = (current, initial) => {
    _.keys(current).forEach((f) => {
      if (
        entity &&
        schema[entity].fields[f] &&
        schema[entity].fields[f].link &&
        current[f] === ""
      ) {
        current[f] = undefined;
      }
    });

    if (_.isEqual(current, initial)) return {}; // Pokud je identické, vrátíme prázdný objekt

    // Najdeme rozdíly mezi objekty
    return _.reduce(
      current,
      (result, value, key) => {
        if (!_.isEqual(value, initial && initial[key])) {
          if (
            typeof value === "string" &&
            initial &&
            initial[key] === undefined &&
            "" === value
          ) {
            //Jsou stejne takze to zahazuju
            return result;
          }
          result[key] =
            _.isObject(value) && !Array.isArray(value)
              ? findChanges(value, initial[key]) // Rekurzivní kontrola objektů
              : value; // Přímá hodnota (pro pole a základní typy)
        }
        return result;
      },
      {}
    );
  };

  useEffect(() => {
    onChange && onChange({ data: watchAllFields });
  }, [watchAllFields]); // Spustí se při změně jakéhokoliv pole

  const formSubmit = (formdata: any, e: any) => {
    const changedData: any = findChanges(formdata, data);
    if (formdata.guid) {
      changedData.guid = formdata.guid;
    }
    onSubmit &&
      onSubmit({
        data: changedData,
        setError,
      });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(formSubmit)}
      className={columns && `grid lg:grid-cols-${columns} gap-${gap || 2}`}
    >
      {formFields.map((item, index) => {
        let formField: FormFieldType = translateFormField({
          schema: schema[entity],
          field: item,
        });

        if (formField.rules) {
          console.log("formField.rules");
          formField = {
            ...formField,
            ...evaluateRules(formField.rules, watchAllFields),
          };
        }

        if (formField.visible === false) return null;

        const c: Control<FieldValues, any> = control as any;
        return renderItem({
          formField,
          key: index,
          control: c,
          gap,
          schema: schema[entity],
        });
      })}
      {children}
      {/* <Button type="submit">Ulozit</Button> */}
    </form>
  );
};

const renderItem = ({
  formField,
  key,
  control,
  gap,
  schema,
}: {
  formField: FormFieldType;
  key: number;
  control: Control<FieldValues, any>;
  gap?: number;
  schema?: EntityType;
}): React.ReactNode => {
  if (formField.type === "Section") {
    return (
      <FormSection
        key={key}
        section={formField}
        control={control}
        gap={gap}
        schema={schema}
      />
    );
  }

  return <FormField key={key} formField={formField} control={control} />;
};

const FormSection = ({
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

const FormField = ({
  formField,
  control,
}: {
  formField: FormFieldType;
  control: Control<FieldValues, any>;
}) => {
  if (!formField.type) {
    debugger;
    formField.type = "text";
  }
  console.log("form formField ", formField);
  switch (formField.type) {
    case "text":
    case "number":
    case "password":
      return (
        <div
          key={formField.field}
          className={formField.colSpan && `col-span-${formField.colSpan}`}
        >
          <Label htmlFor={formField.field}>
            {formField.label}
            {formField.required ? (
              <span className="text-red-600 px-1">*</span>
            ) : null}
          </Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={formField.default || ""}
            rules={{ required: formField.required }}
            render={({ field }) => (
              <TextInput
                {...field}
                {...formField}
                type={formField.type}
                disabled={formField.disabled}
                readOnly={formField.readOnly}
                required={formField.required}
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
                className="block"
                {...field}
                checked={field.value}
                id={formField.field}
                disabled={formField.disabled}
              />
            )}
          />
        </div>
      );
    case "select":
      return (
        <div key={formField.field} className="test select">
          <Label htmlFor={formField.field}>{formField.label}</Label>
          {formField.required ? (
            <span className="text-red-600 px-1">*</span>
          ) : null}
          <Controller
            name={formField.field}
            control={control}
            // defaultValue={formField.default || 1}
            rules={{ required: formField.required }}
            render={({ field }) => <Select {...field} {...formField} />}
          ></Controller>
        </div>
      );
    case "datetime":
      return (
        <div key={formField.field}>
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={false}
            rules={{ required: formField.required }}
            render={({ field }) => <DateTimePicker />}
          />
        </div>
      );
    case "attachment":
      return (
        <div key={formField.field}>
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            rules={{ required: formField.required }}
            render={({ field }) => (
              <FileUpload
                {...field}
                {...formField}
                onChange={(guids) => {
                  console.log("FileUpload returned: ", guids);
                  field.onChange(guids);
                }}
              />
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
