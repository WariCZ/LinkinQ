import { useEffect, useState } from 'react';
import { BaseEditor, Editor, Element } from 'slate'
import { CustomElement } from '../../../types/SlateEditor/types';

const useTable = (editor: BaseEditor) => {
    const [isTable, setIsTable] = useState(false);

    useEffect(() => {
        if (editor.selection) {
            const [tableNode] = Editor.nodes(editor, {
                match: (n: CustomElement) => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'table'
            })

            setIsTable(!!tableNode);
        }
    }, [editor.selection])

    return isTable;
}

export default useTable;