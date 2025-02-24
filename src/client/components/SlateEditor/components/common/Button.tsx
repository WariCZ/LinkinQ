import React, { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface BaseProps {
    className?: string;
    [key: string]: unknown;
}

type ButtonProps = PropsWithChildren<
    BaseProps & {
        active?: boolean;
        reversed?: boolean;
    }
>;

export const Button = ({ className, active = false, reversed = false, ...props }: ButtonProps) => (
    <span
        {...props}
        className={twMerge(
            "cursor-pointer rounded transition-all duration-200",
            reversed
                ? active
                    ? "text-white"
                    : "text-gray-400"
                : active
                    ? "text-black"
                    : "text-gray-300",
            "hover:text-black ",
            "active:bg-black active:text-white",
            className
        )}
    />
);
