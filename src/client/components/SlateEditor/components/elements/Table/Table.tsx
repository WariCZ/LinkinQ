import React, { useEffect, useRef, useState } from 'react';
import usePopup from '../../../hooks/usePopup'
import { BaseRange, Transforms } from 'slate';
import { Icon } from '../../common/Icon';
import { FaTable } from "react-icons/fa6";
import { useTableUtil } from '../../../hooks/useTableUtil';
import { CustomEditor } from '../../../types';
import { Button } from '../../common/Button';

interface TableProps {
    editor: CustomEditor
}

const Table = ({ editor }: TableProps) => {
    const tableOptionsRef = useRef();
    const { insertTable } = useTableUtil(editor);
    const [selection, setSelection] = useState<BaseRange | null>()
    const [showOptions, setShowOptions] = usePopup(tableOptionsRef);
    const [tableData, setTableData] = useState({
        row: 0,
        column: 0,
    })
    const [tableInput, setTableInput] = useState(Array.from({ length: 6 }, () => Array.from({ length: 6 }, (v, i) => ({
        bg: 'lightGray',
        column: i,
    }))))

    useEffect(() => {
        const newTable = Array.from({ length: 6 }, (obj, row) => Array.from({ length: 6 }, (v, col) => ({
            bg: row + 1 <= tableData.row && col + 1 <= tableData.column ? 'orange' : 'lightgray',
            column: col,
        })))
        setTableInput(newTable)
    }, [tableData])

    const handleButtonClick = () => {
        setSelection(editor.selection);
        setShowOptions(prev => !prev)
    }
    const handleInsert = () => {
        selection && Transforms.select(editor, selection)
        setTableData({ row: -1, column: -1 })
        insertTable(tableData.row, tableData.column)
        setShowOptions(false)
    }

    return (
        <div ref={tableOptionsRef} className="relative">
            <Button onClick={handleButtonClick}>
                <Icon IconComponent={FaTable} />
            </Button>
            {showOptions && (
                <div className="absolute mt-2 bg-white shadow-md p-2 rounded-md border border-gray-200 w-max">
                    {tableData.row >= 1 && (
                        <div className="text-sm text-gray-500 mb-1">
                            <i>{`${tableData.row} x ${tableData.column}`}</i>
                        </div>
                    )}
                    <div className="grid grid-cols-6 gap-1">
                        {tableInput.map((grp, row) =>
                            grp.map(({ column, bg }) => (
                                <div
                                    key={`${row}-${column}`}
                                    onClick={handleInsert}
                                    onMouseOver={() => setTableData({ row: row + 1, column: column + 1 })}
                                    className="w-4 h-4 border"
                                    style={{ borderColor: bg }}
                                ></div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Table;