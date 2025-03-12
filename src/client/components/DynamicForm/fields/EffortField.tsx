import { TextInput } from "flowbite-react";

type EffortFieldProps = {
  value?: number | string;
  onChange: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  placeholder?: string;
  unit?: "MD" | "MH";
};

const EffortField = ({
  value = "",
  onChange,
  disabled,
  readOnly,
  label,
  placeholder = "0",
  unit = "MD",
}: EffortFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, "");
    onChange(Number(newValue));
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-500">{label}</label>
      {readOnly ? (
        <span className="text-md font-medium text-gray-700">
          {value ? `${value} ${unit}` : `- ${unit}`}
        </span>
      ) : (
        <TextInput
          type="number"
          value={value?.toString() || ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default EffortField;
