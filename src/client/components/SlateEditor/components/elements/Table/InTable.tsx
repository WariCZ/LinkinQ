import React from "react";
import { Button } from "../../common/Button";
import { useTableUtil } from "../../../hooks/useTableUtil";
import { useSlate } from "slate-react";
import { CustomEditor } from "../../../../../types/SlateEditor/types";
import { Icon } from "../../common/Icon";
import { MdTableRows, MdViewColumn, MdDelete } from "react-icons/md";

const InTable = () => {
    const editor = useSlate();
    const { insertRow, insertColumn, removeTable } = useTableUtil(editor as CustomEditor);

    return (
        <>
            <Button format="insert row" onClick={insertRow}>
                <Icon IconComponent={MdTableRows} className="mr-1" />
            </Button>

            <Button format="insert column" onClick={insertColumn}>
                <Icon IconComponent={MdViewColumn} className=" mr-1" />
            </Button>

            <Button format="remove table" onClick={removeTable}>
                <Icon IconComponent={MdDelete} className=" mr-1 text-red-500" />
            </Button>
        </>
    );
};

export default InTable;
