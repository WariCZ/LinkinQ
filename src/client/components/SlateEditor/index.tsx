import React, { useCallback, useMemo, useRef, useState } from "react";
import { Editable, withReact, Slate } from "slate-react";
import { createEditor, Descendant } from "slate";
import { withHistory } from "slate-history";
import { SlateElement } from "./components/elements/SlateElement";
import { Leaf } from "./components/elements/Leaf";
import Toolbar from "./components/toolbar/Toolbar";
import { withImages } from "./plugins/withImages";
import { withInlines } from "./plugins/withInlines";
import { withTables } from "./plugins/withTables";

type SlateEditorProps = {
  value: Descendant[] | string;
  onChange: (value: Descendant[]) => void;
  placeholder: string;
};

const SlateEditor = ({ value, onChange, placeholder }: SlateEditorProps) => {
  const renderElement = useCallback(
    (props: any) => <SlateElement {...props} />,
    []
  );
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
  const editor = useMemo(
    () =>
      withInlines(
        withTables(withImages(withHistory(withReact(createEditor()))))
      ),
    []
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (
      !event.currentTarget.contains(event.relatedTarget) &&
      (!toolbarRef.current || !toolbarRef.current.contains(event.relatedTarget))
    ) {
      setIsFocused(false);
    }
  };

  const handleToolbarMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsFocused(true);
  };

  const initialValue: Descendant[] =
    Array.isArray(value) && value.length > 0
      ? value
      : [
          {
            type: "paragraph",
            children: [{ text: typeof value === "string" ? value : "" }],
          },
        ];

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => onChange(value)}
    >
      {isFocused && (
        <div ref={toolbarRef} onMouseDown={handleToolbarMouseDown}>
          <Toolbar />
        </div>
      )}
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        spellCheck
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className="w-full h-28 text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm 
             focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto resize-y overflow-x-hidden"
      />
    </Slate>
  );
};

export default SlateEditor;
