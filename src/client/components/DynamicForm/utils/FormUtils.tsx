import { Control, FieldValues } from "react-hook-form";
import { FormFieldType, SectionType } from "../../../types/DynamicForm/types";
import { EntityType } from "@/lib/entity/types";
import { FormSection } from "../elements/FormSection";
import { FormTabs } from "../elements/FormTabs";
import { FormField } from "../fields/FormField";
import globalComponents from "../../globalComponents";
import { CollapsibleSection } from "../../CollapsibleSection";

export const translateFormField = ({
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
    if (
      field.type == "Section" ||
      field.type == "Tabs" ||
      field.type == "Сomponent" ||
      field.type == "СollapsibleSection"
    ) {
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

export const renderItem = ({
  formField,
  key,
  control,
  gap,
  schema,
  readOnly,
}: {
  formField: FormFieldType;
  key: number;
  control: Control<FieldValues, any>;
  gap?: number;
  schema?: EntityType;
  readOnly?: boolean;
}): React.ReactNode => {
  if (formField.type === "Section") {
    return (
      <FormSection
        key={key}
        section={formField}
        control={control}
        schema={schema}
        readOnly={readOnly}
      />
    );
  }

  if (formField.type === "Tabs") {
    return (
      <FormTabs key={key} tabs={formField} control={control} schema={schema} />
    );
  }

  if (formField.type === "Сomponent" && formField.component) {
    const Component =
      typeof formField.component === "string" &&
      globalComponents[formField.component];

    if (!Component) {
      return null;
    }

    return <Component key={key} formField={formField} control={control} readOnly={readOnly}/>;
  }

  if (formField.type === "СollapsibleSection") {
    return (
      <CollapsibleSection
        key={key}
        title={formField.label}
        icon={formField.icon}
      >
        {formField.children?.map((childField, index) =>
          childField.type === "Section" ? (
            <FormSection
              key={index}
              section={childField as SectionType}
              control={control}
              schema={schema}
            />
          ) : (
            <FormField key={index} formField={childField} control={control} />
          )
        )}
      </CollapsibleSection>
    );
  }

  return <FormField key={key} formField={formField} control={control} readOnly={readOnly}/>;
};
