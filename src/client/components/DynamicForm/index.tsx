import React, { useEffect } from "react";
import {
  useForm,
  UseFormSetError,
  Control,
  FieldValues,
  FormProvider,
} from "react-hook-form";
import useStore from "../../store";
import { EntityType } from "../../../lib/entity/types";
import _ from "lodash";
import { ConditionType, FormFieldType } from "../../types/DynamicForm/types";
import { renderItem, translateFormField } from "./utils/FormUtils";

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

const DynamicForm = ({
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

  const form = useForm({
    disabled: disabled,
    defaultValues: {},
  });

  const { control, handleSubmit, reset, setError, watch } = form;
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

  const findChanges = (current: object, initial: Record<string, any>) => {
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

    if (_.isEqual(current, initial)) return {};

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
            return result;
          }
          result[key] =
            _.isObject(value) && !Array.isArray(value)
              ? findChanges(value, initial[key])
              : value;
        }
        return result;
      },
      {}
    );
  };

  useEffect(() => {
    onChange && onChange({ data: watchAllFields });
  }, [watchAllFields]);

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
    <FormProvider {...form}>
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
      </form>
    </FormProvider>
  );
};

export default DynamicForm;
