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

  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
      )}
      onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon IconComponent={icon} />
    </Button>
  );
};
