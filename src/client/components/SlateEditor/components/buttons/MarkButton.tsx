import { useSlate } from "slate-react";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";
import { BaseEditor, Editor } from "slate";
import { IconType } from "react-icons";

type MarkButtonProps = {
  format: string;
  icon: IconType;
};

export const MarkButton = ({ format, icon }: MarkButtonProps) => {
  const editor = useSlate();

  const isMarkActive = (editor: BaseEditor, format: string) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const toggleMark = (editor: BaseEditor, format: string) => {
    const isActive = isMarkActive(editor, format);
    isActive
      ? Editor.removeMark(editor, format)
      : Editor.addMark(editor, format, true);
  };

  return (
    <Button
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
