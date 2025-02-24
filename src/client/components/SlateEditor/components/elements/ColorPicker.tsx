import React, { useRef, useState } from 'react';
import { MdCheck, MdOutlineFormatColorText } from 'react-icons/md';
import { BaseRange, Editor, Transforms } from 'slate';
import { colors } from '../../utils/defaultColors';
import { FormEvent } from 'react';
import { ChangeEvent } from 'react';
import usePopup from '../../hooks/usePopup';
import { CustomEditor, FormatType } from '../../types';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';

type ColorPickerProps = {
    format: FormatType;
    editor: CustomEditor
}

const isValideHexSix = /^#[0-9A-Za-z]{6}$/;
const isValideHexThree = /^#[0-9A-Za-z]{3}$/;

export const ColorPicker = ({ format, editor }: ColorPickerProps) => {
    const [selection, setSelection] = useState<BaseRange | null>();
    const [hexValue, setHexValue] = useState('');
    const [validHex, setValidHex] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement | null>(null);
    const [showOptions, setShowOptions] = usePopup(colorPickerRef);

    const addMarkData = (editor: Editor, data: { format: FormatType; value: string | boolean }): void => {
        Editor.addMark(editor, data.format, data.value);
    };

    const changeColor = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const clickedColor = target.getAttribute("data-value");

        if (!clickedColor) return;

        selection && Transforms.select(editor, selection);
        addMarkData(editor, { format, value: clickedColor });
        setShowOptions(false);
    };

    const toggleOption = () => {
        setSelection(editor.selection);
        setShowOptions((prev) => !prev);
    };

    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validHex) return;
        selection && Transforms.select(editor, selection);
        addMarkData(editor, { format, value: hexValue });
        setShowOptions(false);
        setValidHex(false);
        setHexValue('');
    };

    const handleHexChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        setValidHex(isValideHexSix.test(newHex) || isValideHexThree.test(newHex));
        setHexValue(newHex);
    };

    return (
        <div className='relative' ref={colorPickerRef}>
            <Button onClick={toggleOption}>
                <Icon IconComponent={MdOutlineFormatColorText} />
            </Button>
            {showOptions && (
                <div className='absolute left-0 bg-white shadow-md p-3 rounded-md z-10'>
                    <div className='grid grid-cols-7 gap-1'>
                        {colors.map((color, index) => (
                            <div key={index} data-value={color} onClick={changeColor} className='w-4 h-4 rounded cursor-pointer' style={{ background: color }}></div>
                        ))}
                    </div>
                    <p className='text-center text-gray-500 text-sm mt-2'>OR</p>
                    <form onSubmit={handleFormSubmit} className='flex items-center gap-2 mt-2'>
                        <div className='w-4 h-4 rounded' style={{ background: validHex ? hexValue : '#000000' }}></div>
                        <input type='text' placeholder='#000000' value={hexValue} onChange={handleHexChange} className={`w-16 h-6 border rounded p-1 text-sm ${validHex === false ? 'border-red-500' : 'border-gray-300'}`} />
                        <button type='submit' className='text-green-500'>
                            <MdCheck size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
