import Image from "./Image";
import { Link } from "./Link";
import { ElementProps } from "../../types";

export const SlateElement = ({ attributes, children, element }: ElementProps) => {
    switch (element.type) {
        case "alignLeft":
            return (
                <div className="text-left" {...attributes} {...element.attr}>
                    {children}
                </div>
            );
        case "alignCenter":
            return (
                <div className="flex justify-center" {...attributes} {...element.attr}>
                    {children}
                </div>
            );
        case "alignRight":
            return (
                <div className="flex justify-end" {...attributes} {...element.attr}>
                    {children}
                </div>
            );
        case "orderedList":
            return (
                <ol {...attributes} className="list-decimal">
                    {children}
                </ol>
            );
        case "unorderedList":
            return (
                <ul {...attributes} className="list-disc pl-6">
                    {children}
                </ul>
            );
        case "list-item":
            return (
                <li {...attributes} className="ml-4">
                    {children}
                </li>
            );
        case "link":
            return <Link attributes={attributes} children={children} element={element} />;
        case "table":
            return (
                <table>
                    <tbody {...attributes}>{children}</tbody>
                </table>
            );
        case "table-row":
            return <tr {...attributes} className="border border-gray-300">{children}</tr>;
        case "table-cell":
            return (
                <td
                    {...element.attr}
                    {...attributes}
                    className="border border-gray-300 p-2"
                >
                    {children}
                </td>
            );

        case "image":
            return <Image attributes={attributes} children={children} element={element} />;
        default:
            return (
                <div {...element.attr} {...attributes} className="text-base text-gray-800">
                    {children}
                </div>
            );
    }
};
