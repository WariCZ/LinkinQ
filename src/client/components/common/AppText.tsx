import React from "react";

interface AppTextProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const AppText = ({
  children,
  className = "",
  as: Component = "span",
}: AppTextProps) => {
  return (
    <Component className={`text-gray-800 dark:text-gray-200 ${className}`}>
      {children}
    </Component>
  );
};
