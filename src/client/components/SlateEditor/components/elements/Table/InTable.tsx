import React from "react";
import { Button } from "../../common/Button";
import { useTableUtil } from "../../../hooks/useTableUtil";
import { useSlate } from "slate-react";
import { CustomEditor } from "../../../../../types/SlateEditor/types";
import { Icon } from "../../common/Icon";
import { MdTableRows, MdViewColumn, MdDelete } from "react-icons/md";

const InTable = () => {
  const editor = useSlate();
  const { insertRow, insertColumn, removeTable } = useTableUtil(
    editor as CustomEditor
  );

  return (
    <>
      <Button format="insert row" onClick={insertRow} className="rounded border p-1 text-sm transition-all hover:bg-gray-200
        bg-white text-black">
        <Icon IconComponent={MdTableRows} />
      </Button>

      <Button format="insert column" onClick={insertColumn} className="rounded border p-1 text-sm transition-all hover:bg-gray-200
        bg-white text-black">
        <Icon IconComponent={MdViewColumn} />
      </Button>

      <Button format="remove table" onClick={removeTable} className="rounded border p-1 text-sm transition-all hover:bg-gray-200
        bg-white text-black">
        <Icon IconComponent={MdDelete} className=" text-red-500" />
      </Button>
    </>
  );
};

export default InTable;
