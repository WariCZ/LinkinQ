import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Editable, withReact, Slate } from "slate-react";
import { createEditor, Descendant } from "slate";
import { withHistory } from "slate-history";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { SlateElement } from "./components/elements/SlateElement";
import { Leaf } from "./components/elements/Leaf";
import Toolbar from "./components/toolbar/Toolbar";
import { withImages } from "./plugins/withImages";
import { withInlines } from "./plugins/withInlines";
import { withTables } from "./plugins/withTables";
import { toggleMark } from "./utils";
import isHotkey from "is-hotkey";
import { useFormContext } from "react-hook-form";

type SlateEditorProps = {
  value: Descendant[] | string;
  onChange: (value: Descendant[]) => void;
  placeholder: string;
  field: any;
  readOnly?: boolean;
};

const HOTKEYS: Record<string, any> = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
};

const getDefaultValue = (value) => {
  return Array.isArray(value) && value.length > 0
    ? value
    : [
        {
          type: "paragraph",
          children: [{ text: typeof value === "string" ? value : "" }],
        },
      ];
};

const SlateEditor = ({
  value,
  onChange,
  placeholder,
  field,
  readOnly,
}: SlateEditorProps) => {
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
  const [slateValue, setSlateValue] = useState(getDefaultValue(value));
  const [isFocused, setIsFocused] = useState(false);
  const [editorKey, setEditorKey] = useState(uuidv4());
  const { trigger } = useFormContext();
  useEffect(() => {
    if (value) {
      if (!_.isEqual(value, slateValue)) {
        // Při změně dat z API aktualizujte klíč editoru
        setSlateValue(getDefaultValue(value));
        setEditorKey(uuidv4());
      }
    }
  }, [value]);

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
      key={editorKey}
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => {
        onChange(value);
        trigger(field.name);
      }}
    >
      {isFocused && (
        <div ref={toolbarRef} onMouseDown={handleToolbarMouseDown}>
          <Toolbar />
        </div>
      )}
      <Editable
        readOnly={readOnly}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        // placeholder={placeholder}
        spellCheck
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
        className="w-full h-28 text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm 
             focus:outline-none focus:ring-1 focus:ring-cyan-500 overflow-y-auto resize-y overflow-x-hidden p-2"
      />
    </Slate>
  );
};

export default SlateEditor;
