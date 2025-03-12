import { useSlate } from "slate-react";
import { Button } from "../common/Button";
import { isLinkActive, unwrapLink } from "./AddLinkButton";
import { Icon } from "../common/Icon";
import { MdLinkOff } from "react-icons/md";
import { CustomEditor } from "../../../../types/SlateEditor/types";

export const RemoveLinkButton = () => {
  const editor = useSlate();

  return (
    <Button
      active={isLinkActive(editor as CustomEditor)}
      onMouseDown={() => {
        if (isLinkActive(editor as CustomEditor)) {
          unwrapLink(editor as CustomEditor);
        }
      }}
    >
      <Icon IconComponent={MdLinkOff} />
    </Button>
  );
};
