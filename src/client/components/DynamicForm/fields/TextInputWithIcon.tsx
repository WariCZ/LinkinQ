import { TextInput } from "flowbite-react";
import React from "react";
import { IconType } from "react-icons";

interface TextInputWithIconProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: IconType;
}

const TextInputWithIcon: React.FC<TextInputWithIconProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  icon: Icon,
}) => {
  return (
    <div className="flex items-center w-full gap-2">
      {Icon && (
        <div className="left-3 ">
          <Icon size={16} />
        </div>
      )}
      <TextInput
        size={20}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
        sizing="xl"
      />
    </div>
  );
};

export default TextInputWithIcon;
