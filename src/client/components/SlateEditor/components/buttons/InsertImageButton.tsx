import { useSlateStatic } from "slate-react";
import { Button } from "../common/Button";
import { insertImage, isImageUrl } from "../../plugins/withImages";
import { Icon } from "../common/Icon";
import { IconType } from "react-icons";
import { CustomEditor } from "../../../../types/SlateEditor/types";
interface InsertImageButtonProps {
  icon: IconType;
}

export const InsertImageButton = ({ icon }: InsertImageButtonProps) => {
  const editor = useSlateStatic();
  return (
    <Button
      className="rounded border p-1 text-sm transition-all hover:bg-gray-200
        bg-white text-black"
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        const url = window.prompt("Enter the URL of the image:");
        if (url && !isImageUrl(url)) {
          alert("URL is not an image");
          return;
        }
        url && insertImage(editor as CustomEditor, url);
      }}
    >
      <Icon IconComponent={icon} />
    </Button>
  );
};
