import { Select } from "flowbite-react";
import React from "react";

interface Option {
  label: string;
  value: string | number;
}

interface AppSelectProps {
  id?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const AppSelect = ({
  id,
  value,
  onChange,
  options,
  required,
  disabled,
  placeholder,
  className,
}: AppSelectProps) => {
  return (
    <Select
      id={id}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={className}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
};
