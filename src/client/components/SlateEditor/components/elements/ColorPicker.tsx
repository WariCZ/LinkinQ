import React, { useRef, useState } from "react";
import { MdCheck, MdOutlineFormatColorText } from "react-icons/md";
import { BaseRange, Editor, Transforms } from "slate";
import { colors } from "../../utils/defaultColors";
import { FormEvent } from "react";
import { ChangeEvent } from "react";
import usePopup from "../../hooks/usePopup";
import { CustomEditor, FormatType } from "../../../../types/SlateEditor/types";
import { Icon } from "../common/Icon";
import { Button } from "../common/Button";

type ColorPickerProps = {
  format: FormatType;
  editor: CustomEditor;
};

const isValideHexSix = /^#[0-9A-Za-z]{6}$/;
const isValideHexThree = /^#[0-9A-Za-z]{3}$/;

export const ColorPicker = ({ format, editor }: ColorPickerProps) => {
  const [selection, setSelection] = useState<BaseRange | null>();
  const [hexValue, setHexValue] = useState("");
  const [validHex, setValidHex] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement | null>(null);
  const [showOptions, setShowOptions] = usePopup(colorPickerRef);

  const addMarkData = (
    editor: Editor,
    data: { format: FormatType; value: string | boolean }
  ): void => {
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
    setHexValue("");
  };

  const handleHexChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setValidHex(isValideHexSix.test(newHex) || isValideHexThree.test(newHex));
    setHexValue(newHex);
  };

  return (
    <div ref={colorPickerRef} className="relative inline-block">
      <button
        onClick={toggleOption}
        className={`rounded border p-1 text-sm transition-all hover:bg-gray-200 bg-white text-black 
      ${showOptions ? "bg-gray-300" : ""}`}
      >
        <Icon IconComponent={MdOutlineFormatColorText} />
      </button>
      {showOptions && (
        <div className="absolute left-0 top-full mt-2 bg-white shadow-md p-3 rounded-md z-10">
          <div className="grid grid-cols-7 gap-1">
            {colors.map((color, index) => (
              <div
                key={index}
                data-value={color}
                onClick={changeColor}
                className="w-5 h-5 rounded cursor-pointer border border-gray-300 transition-transform"
                style={{ background: color }}
              ></div>
            ))}
          </div>

          <p className="text-center text-gray-500 text-sm mt-2">OR</p>

          <form
            onSubmit={handleFormSubmit}
            className="flex items-center gap-2 mt-2"
          >
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ background: validHex ? hexValue : "#000000" }}
            ></div>
            <input
              type="text"
              placeholder="#000000"
              value={hexValue}
              onChange={handleHexChange}
              className={`w-20 h-7 border rounded p-1 text-sm outline-none focus:border-blue-500
            ${validHex === false ? "border-red-500" : "border-gray-300"}`}
            />
            <button
              type="submit"
              className="text-green-500 hover:text-green-700 transition-colors"
            >
              <MdCheck size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
