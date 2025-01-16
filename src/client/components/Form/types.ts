import { TextInputProps } from "flowbite-react";

type RuleType = "show" | "hide" | "required" | "optional";

export type ConditionType = Record<string, string | number>;

type FormFieldDefault = {
  label?: string;
  field?: string;
  readOnly?: boolean;
  disabled?: boolean;
  id?: string;
  required?: boolean;
  visible?: boolean;
  default?: string | number;
  rules?: {
    type: RuleType; // Typ pravidla
    conditions: ConditionType[]; // Pole podmínek
  }[];
  colSpan?: number;
};

type FormFieldSelect = {
  type: "select";
  options?: { value: string | number; label: string }[];
  entity?: string;
  isMulti?: boolean;
} & FormFieldDefault;

type FormFieldText = {
  type: "text" | "checkbox" | "number" | "password" | "datetime";
} & FormFieldDefault &
  TextInputProps &
  React.RefAttributes<HTMLInputElement>;

export type SectionType = {
  type: "Section";
  label?: string;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  fields: (FormFieldType | SectionType)[];
  colSpan?: number;
} & FormFieldDefault;

export type FormFieldType = FormFieldSelect | FormFieldText | SectionType;
