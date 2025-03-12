import { RenderLeafProps } from "slate-react";

interface LeafFormat {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  color?: string;
  link?: string;
}

export interface LeafProps extends Omit<RenderLeafProps, "leaf"> {
  leaf: LeafFormat;
}

export const Leaf = ({ attributes, children, leaf }: LeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.strikethrough) {
    children = (
      <span style={{ textDecoration: "line-through" }}>{children}</span>
    );
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.color) {
    children = <span style={{ color: leaf.color }}>{children}</span>;
  }
  if (leaf.link) {
    children = (
      <a
        href={leaf.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline hover:text-blue-700"
      >
        {children}
      </a>
    );
  }
  return <span {...attributes}>{children}</span>;
};
