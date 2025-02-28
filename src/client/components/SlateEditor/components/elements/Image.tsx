import React from "react";
import { useSelected, useFocused, useSlateStatic, ReactEditor } from "slate-react";
import { Button } from "../common/Button";
import { Transforms } from "slate";
import { ElementProps } from "../../../../types/SlateEditor/types";
import { Icon } from "../common/Icon";
import { MdDelete } from "react-icons/md";

const Image = ({ attributes, children, element }: ElementProps) => {
    const editor = useSlateStatic();
    const path = ReactEditor.findPath(editor as ReactEditor, element);

    const selected = useSelected();
    const focused = useFocused();
    const isActive = selected && focused;

    return (
        <div {...attributes}>
            {children}
            <div contentEditable={false} className="relative">
                <img
                    src={element.url}
                    alt="Inserted"
                    className={`block max-w-full max-h-[20em] ${isActive ? "shadow-outline-blue" : ""}`}
                />
                <Button
                    active
                    onClick={() => Transforms.removeNodes(editor, { at: path })}
                    className={`absolute top-2 left-2 bg-white p-1 rounded shadow-md transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
                >
                    <Icon IconComponent={MdDelete} />
                </Button>
            </div>
        </div>
    );
};

export default Image;