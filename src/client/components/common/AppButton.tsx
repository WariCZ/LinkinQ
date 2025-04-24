import { Button, ButtonProps } from "flowbite-react";
import { ReactNode } from "react";

interface AppButtonProps extends ButtonProps {
  icon?: ReactNode;
  children?: ReactNode;
  iconPosition?: "left" | "right";
}

export const AppButton = ({
  icon,
  children,
  iconPosition = "left",
  className,
  ...props
}: AppButtonProps) => {
  return (
    <Button className={`h-full ${className ?? ""}`} {...props}>
      <span className="flex items-center justify-center">
        {icon && iconPosition === "left" && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === "right" && (
          <span className="ml-2">{icon}</span>
        )}
      </span>
    </Button>
  );
};
