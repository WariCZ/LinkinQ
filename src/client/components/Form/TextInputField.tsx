import { TextInput as FlowbiteTextInput } from "flowbite-react";
import React from "react";

export default function TextInput({
  field,
  value,
  onChange,
}: {
  field: {
    type: string;
    key: string;
    label: string;
    placeholder?: string;
  };
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "TextInput") {
    return (
      <div className="form-field">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
        </label>
        <FlowbiteTextInput
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
        />
      </div>
    );
  }

  return null;
}
