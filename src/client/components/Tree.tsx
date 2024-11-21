import React, { useState } from "react";

// Definice typů
export type TreeNode = {
  name: string;
  children: TreeNode[];
};

type TreeNodeProps = {
  node: TreeNode;
};

type TreeProps = {
  data: TreeNode[];
};

const TreeNodeComponent = ({ node }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-4">
      <div
        className="flex items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {hasChildren && (
          <span
            className={`mr-2 transition-transform ${isOpen ? "rotate-90" : ""}`}
          >
            ▶
          </span>
        )}
        <span>{node.name}</span>
      </div>
      {hasChildren && isOpen && (
        <div className="ml-4 border-l border-gray-300 pl-2">
          {node.children.map((child, index) => (
            <TreeNodeComponent key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const Tree = ({ data }: TreeProps) => {
  return (
    <div>
      {data.map((node, index) => (
        <TreeNodeComponent key={index} node={node} />
      ))}
    </div>
  );
};

export default Tree;
