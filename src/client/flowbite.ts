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
        insideCollapse: "group w-full pl-1 transition duration-75",
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
  modal: {
    root: {
      base: "no-transform-modal fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
      show: {
        on: "flex bg-transparent shadow-none pointer-events-none",
      },
    },
    content: {
      base: "relative h-full w-full p-4 md:h-auto pointer-events-auto",
      inner:
        "shadow-lg shadow-gray-500/50 border border-gray-200 relative flex max-h-[90dvh] flex-col rounded-sm bg-white shadow dark:bg-gray-700",
    },
    header: {
      base: "flex items-start justify-between rounded-t border-b p-1 dark:border-gray-600",
      close: {
        base: "ml-auto inline-flex items-center rounded-md bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
        icon: "h-3 w-3",
      },
      title: "px-2",
    },
    footer: {
      base: "flex items-center space-x-2 rounded-b border-gray-200 p-2 dark:border-gray-600",
      popup: "border-t",
    },
    // header: {
    //   popup: "border-b-0 p-2",
    // },
    // footer: {
    //   base: "flex items-center space-x-2 rounded-b border-gray-200 p-6 dark:border-gray-600",
    //   popup: "border-t",
    // },
  },
  textInput: {
    addon:
      "inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400",
    field: {
      input: {
        sizes: {
          sm: "p-2 sm:text-xs",
          md: "py-1 px-2 text-sm",
          lg: "p-4 sm:text-base",
        },
        withAddon: {
          on: "rounded-r-md",
          off: "rounded-md",
        },
      },
    },
  },
};
