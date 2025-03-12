import { Descendant, BaseElement, BaseEditor } from "slate";
import { ReactEditor, RenderElementProps } from "slate-react";

export type LinkElement = {
  type: "link";
  url: string;
  children: Descendant[];
};

export interface CustomElement extends BaseElement {
  type: string;
  children: CustomElement[];
  attr?: Record<string, any>;
  url?: string;
  align?: string;
}

export type CustomEditor = BaseEditor & ReactEditor;

export type FormatType = string;

export interface ElementProps extends RenderElementProps {
  element: CustomElement;
}
