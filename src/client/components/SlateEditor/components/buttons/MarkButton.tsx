import { useSlate } from "slate-react";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";
import { IconType } from "react-icons";
import { isMarkActive, toggleMark } from "../../utils";

type MarkButtonProps = {
  format: string;
  icon: IconType;
};

export const MarkButton = ({ format, icon }: MarkButtonProps) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  return (
    <Button
      className={`rounded border p-1 text-sm transition-all 
      ${isActive ? "bg-gray-200 text-black font-bold" : "bg-white text-gray-600"}
      hover:bg-gray-200`}
      active={isMarkActive(editor, format)}
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon IconComponent={icon} />
    </Button>
  );
};
