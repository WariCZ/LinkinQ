import { useSlate } from "slate-react";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";
import { isBlockActive, TEXT_ALIGN_TYPES, toggleBlock } from "../../utils";
import { IconType } from "react-icons";

export const BlockButton = ({
  format,
  icon,
}: {
  format: string;
  icon: IconType;
}) => {
  const editor = useSlate();
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );

  return (
    <Button
      className={`rounded border p-1 text-sm transition-all 
        ${isActive ? "bg-gray-200 text-black font-bold" : "bg-white text-gray-600"}
        hover:bg-gray-200`}
      onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon IconComponent={icon} />
    </Button>
  );
};
