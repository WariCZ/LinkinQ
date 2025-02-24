import { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";

interface IconProps {
    IconComponent: IconType;
    className?: string
}

export const Icon = ({ IconComponent, className }: IconProps) => {
    return <IconComponent className={twMerge("w-5 h-5", className)} />;
};