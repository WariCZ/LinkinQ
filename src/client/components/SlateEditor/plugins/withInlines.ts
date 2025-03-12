import isUrl from "is-url";
import { Transforms, Editor, Range, Element as SlateElement } from "slate";
import type {
  CustomEditor,
  LinkElement,
} from "../../../types/SlateEditor/types";

const isLinkActive = (editor: Editor): boolean => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as LinkElement).type === "link",
  });
  return !!link;
};

const unwrapLink = (editor: Editor): void => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as LinkElement).type === "link",
  });
};

const wrapLink = (editor: Editor, url: string): void => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

export const withInlines = (editor: CustomEditor) => {
  const { insertData, insertText, isInline, isElementReadOnly, isSelectable } =
    editor;

  editor.isInline = (element: SlateElement): boolean =>
    ["link", "button", "badge"].includes(element.type) || isInline(element);

  editor.isElementReadOnly = (element: SlateElement): boolean =>
    element.type === "badge" || isElementReadOnly(element);

  editor.isSelectable = (element: SlateElement): boolean =>
    element.type !== "badge" && isSelectable(element);

  editor.insertText = (text: string): void => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data: DataTransfer): void => {
    const text = data.getData("text/plain");

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};
