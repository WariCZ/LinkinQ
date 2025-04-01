import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CiMenuBurger } from "react-icons/ci";
interface MenuItemConfig {
    label: string;
    icon?: React.ReactNode;
    onSelect?: () => void;
    subItems?: MenuItemConfig[];
    danger?: boolean;
}

interface RowMenuProps {
    colorOptions?: string[];
    onColorSelect?: (color: string) => void;
    menuItems: MenuItemConfig[];
}

export const RowMenu = ({
    colorOptions = ['#fff', 'yellow', 'red', 'purple', 'blue', 'green', 'black'],
    onColorSelect,
    menuItems,
}: RowMenuProps) => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="hover:bg-gray-200 rounded p-2">
                    <CiMenuBurger />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    side="bottom"
                    align="end"
                    className="z-50 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                    <div className="flex gap-2 px-4 py-2 border-b">
                        {colorOptions.map((color) => (
                            <div
                                key={color}
                                className="w-5 h-5 rounded-full border cursor-pointer"
                                style={{ backgroundColor: color }}
                                onClick={() => onColorSelect?.(color)}
                            />
                        ))}
                    </div>

                    {menuItems.map((item, index) => {
                        if (item.subItems && item.subItems.length > 0) {
                            return (
                                <DropdownMenu.Sub key={index}>
                                    <DropdownMenu.SubTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            {item.icon}
                                            {item.label}
                                        </div>
                                        <span className="text-xs">▶</span>
                                    </DropdownMenu.SubTrigger>
                                    <DropdownMenu.Portal>
                                        <DropdownMenu.SubContent
                                            sideOffset={6}
                                            className="z-50 w-64 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 py-1"
                                        >
                                            {item.subItems.map((subItem, subIndex) => (
                                                <DropdownMenu.Item
                                                    key={subIndex}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                    onSelect={subItem.onSelect}
                                                >
                                                    {subItem.icon} {subItem.label}
                                                </DropdownMenu.Item>
                                            ))}
                                        </DropdownMenu.SubContent>
                                    </DropdownMenu.Portal>
                                </DropdownMenu.Sub>
                            );
                        }

                        if (item.danger) {
                            return (
                                <>
                                    <DropdownMenu.Separator className="my-1 border-t border-gray-200" />
                                    <DropdownMenu.Item
                                        key={index}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-100 cursor-pointer"
                                        onSelect={item.onSelect}
                                    >
                                        {item.icon} {item.label}
                                    </DropdownMenu.Item>
                                </>
                            );
                        }

                        return (
                            <DropdownMenu.Item
                                key={index}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                onSelect={item.onSelect}
                            >
                                {item.icon} {item.label}
                            </DropdownMenu.Item>
                        );
                    })}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
