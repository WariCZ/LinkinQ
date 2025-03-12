import {
  Transforms,
  Editor,
  Range,
  Element as SlateElement,
  Path,
} from "slate";
import { CustomEditor, CustomElement } from "../../../types/SlateEditor/types";

type TableCell = {
  type: "table-cell";
  children: Paragraph[];
};

type TableRow = {
  type: "table-row";
  children: TableCell[];
};

type Table = {
  type: "table";
  children: TableRow[];
};

type Paragraph = {
  type: "paragraph";
  children: TextNode[];
};

type TextNode = {
  text: string;
};

type TableAction = "row" | "columns";

export const useTableUtil = (editor: CustomEditor) => {
  const insertTable = (rows: number, columns: number): void => {
    const [tableNode] = Editor.nodes<Table>(editor, {
      match: (n: CustomElement) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "table",
      mode: "highest",
    });

    if (tableNode || !rows || !columns) return;

    const cellText = Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => "")
    );
    const newTable = createTableNode(cellText);

    Transforms.insertNodes(editor, newTable, { mode: "highest" });
    Transforms.insertNodes(
      editor,
      { type: "paragraph", children: [{ text: "" }] } as Paragraph,
      {
        mode: "highest",
      }
    );
  };

  const insertCells = (
    tableNode: Table,
    path: Path,
    action: TableAction
  ): void => {
    let existingText = tableNode.children.map((row) =>
      row.children.map((cell) => cell.children[0].children[0].text)
    );
    const columns = existingText[0].length;

    if (action === "row") {
      existingText.push(Array(columns).fill(""));
    } else {
      existingText = existingText.map((row) => [...row, ""]);
    }

    const newTable = createTableNode(existingText);
    Transforms.insertNodes(editor, newTable, { at: path });
  };

  const removeTable = (): void => {
    Transforms.removeNodes(editor, {
      match: (n: CustomElement) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "table",
      mode: "highest",
    });
  };

  const insertRow = (): void => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [tableNodeEntry] = Editor.nodes<Table>(editor, {
        match: (n: CustomElement) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "table",
      });

      if (tableNodeEntry) {
        const [tableNode, path] = tableNodeEntry;
        removeTable();
        insertCells(tableNode, path, "row");
      }
    }
  };

  const insertColumn = (): void => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [tableNodeEntry] = Editor.nodes<Table>(editor, {
        match: (n: CustomElement) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "table",
      });

      if (tableNodeEntry) {
        const [tableNode, path] = tableNodeEntry;
        removeTable();
        insertCells(tableNode, path, "columns");
      }
    }
  };

  return { insertTable, insertRow, insertColumn, removeTable };
};

const createRow = (cellText: string[]): TableRow => ({
  type: "table-row",
  children: cellText.map((value) => createTableCell(value)),
});

export const createTableCell = (text: string): TableCell => ({
  type: "table-cell",
  children: [{ type: "paragraph", children: [{ text }] }],
});

const createTableNode = (cellText: string[][]): Table => ({
  type: "table",
  children: cellText.map((row) => createRow(row)),
});
