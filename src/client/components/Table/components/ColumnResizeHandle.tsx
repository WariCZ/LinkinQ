import React from "react";

interface ColumnResizeHandleProps {
  onMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onTouchStart: React.TouchEventHandler<HTMLDivElement>;
}

const ColumnResizeHandle: React.FC<ColumnResizeHandleProps> = ({
  onMouseDown,
  onTouchStart,
}) => {
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`absolute right-0 top-0 h-full w-0.5 cursor-col-resize select-none z-10 transition ${true ? "bg-white" : "bg-transparent hover:bg-blue-300"}`}
    />
  );
};

export default ColumnResizeHandle;
