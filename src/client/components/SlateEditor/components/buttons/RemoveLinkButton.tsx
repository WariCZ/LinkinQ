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
      className="rounded border p-1 text-sm transition-all hover:bg-gray-200
        bg-white text-black"
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
