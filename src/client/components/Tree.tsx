import React, { useState } from "react";

// Definice typů
export type TreeNode = {
  name: string;
  id?: string;
  active?: boolean;
  children: TreeNode[];
};

type TreeNodeProps = {
  node: TreeNode;
  onClick?: (node: any) => void;
};

type TreeProps = {
  data: TreeNode[];
  onClick?: (node: any) => void;
};

const TreeNodeComponent = ({ node, onClick }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-1">
      <div
        className="flex items-center cursor-pointer select-none"
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          } else {
            onClick && onClick(node);
          }
        }}
      >
        <span className={`${hasChildren || node.active ? "" : "line-through"}`}>
          {node.name}
        </span>
      </div>
      {hasChildren && isOpen && (
        <div className="ml-1 border-l border-gray-300 pl-1">
          {node.children.map((child, index) => (
            <TreeNodeComponent key={index} node={child} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  );
};

const Tree = ({ data, onClick }: TreeProps) => {
  return (
    <div>
      {data.map((node, index) => (
        <TreeNodeComponent key={index} node={node} onClick={onClick} />
      ))}
    </div>
  );
};

export default Tree;
