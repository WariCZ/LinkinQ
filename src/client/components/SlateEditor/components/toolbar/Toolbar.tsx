import React from 'react';
import { useSlate } from 'slate-react'
import useTable from '../../hooks/useTable.js';
import { BlockButton } from '../buttons/BlockButton.jsx';
import { MarkButton } from '../buttons/MarkButton.jsx';
import Table from '../elements/Table/Table.jsx';
import { InsertImageButton } from '../buttons/InsertImageButton.jsx';
import { AddLinkButton } from '../buttons/AddLinkButton.jsx';
import { RemoveLinkButton } from '../buttons/RemoveLinkButton.jsx';
import InTable from '../elements/Table/InTable.jsx';
import { ColorPicker } from '../elements/ColorPicker.jsx';
import { CustomEditor } from '../../types.js';
import { defaultToolbarGroups } from './defaultToolbarGroups.js';

const Toolbar = () => {
    const editor = useSlate();
    const isTable = useTable(editor);

    return (
        <div className='fixed top-0 left-0 right-0 z-50 flex gap-1 shadow-md p-2 rounded-md h-10 items-center bg-white justify-center'>
        {defaultToolbarGroups.map((group, index) => (
            <span key={index} className='flex gap-2 items-center'>
                {group.map((element) => {
                    switch (element.type) {
                        case 'block':
                            return <BlockButton key={element.id} format={element.format} icon={element.icon} />;
                        case 'mark':
                            return <MarkButton key={element.id} format={element.format} icon={element.icon} />;
                        case 'color-picker':
                            return <ColorPicker key={element.id} format={element.format} editor={editor as CustomEditor} />;
                        case 'image':
                            return <InsertImageButton key={element.id} icon={element.icon} />;
                        case 'table':
                            return <Table key={element.id} editor={editor as CustomEditor} />;
                        case 'inTable':
                            return isTable ? <InTable key={element.id} /> : null;
                        case "link":
                            return <AddLinkButton key={element.id} />;
                        case "link-remove":
                            return <RemoveLinkButton key={element.id} />;
                        default:
                            return <button key={element.id}>Invalid Button</button>;
                    }
                })}
    
                {/* Přidání oddělovače kromě poslední skupiny */}
                {index < defaultToolbarGroups.length - 1 && (
                    <span className="mx-2 text-gray-400">|</span>
                )}
            </span>
        ))}
    </div>
    );
};

export default Toolbar;
