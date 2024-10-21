import { CustomFlowbiteTheme } from "flowbite-react";

export const customTheme: CustomFlowbiteTheme = {
  button: {
    size: {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-0.5 text-sm",
      lg: "px-5 py-2.5 text-base",
      xl: "px-6 py-3 text-base",
    },
    pill: {
      off: "rounded-md",
      on: "rounded-full",
    },
  },
  sidebar: {
    item: {
      base: "py-1 flex items-center justify-center rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
      active: "bg-gray-100 dark:bg-gray-700",
      icon: {
        base: "h-4 w-4 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
        active: "text-gray-700 dark:text-gray-100",
      },
      collapsed: {
        insideCollapse: "group w-full pl-6 transition duration-75",
        noIcon: "font-bold",
      },
    },
    itemGroup: {
      base: "mt-4 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700",
    },
    collapse: {
      button:
        "group flex w-full items-center rounded-lg text-sm font-medium text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
      icon: {
        base: "h-4 w-4 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
        open: {
          off: "",
          on: "text-gray-900",
        },
      },
      label: {
        base: "py-1 ml-3 flex-1 whitespace-nowrap text-left",
        icon: {
          base: "h-4 w-4 transition delay-0 ease-in-out",
          open: {
            on: "rotate-180",
            off: "",
          },
        },
      },
      list: "space-y-1 py-1 bg-gray-100 dark:bg-gray-700",
    },
  },
};
