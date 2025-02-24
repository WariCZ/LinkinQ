import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdFormatListNumbered, MdFormatListBulleted, MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdOutlineStrikethroughS } from "react-icons/md";
import { FaImage } from 'react-icons/fa6';

export const defaultToolbarGroups = [
    [
        { id: 1, format: 'bold', type: 'mark', icon: MdFormatBold },
        { id: 2, format: 'italic', type: 'mark', icon: MdFormatItalic },
        { id: 3, format: 'underline', type: 'mark', icon: MdFormatUnderlined },
        { id: 4, format: 'strikethrough', type: 'mark', icon: MdOutlineStrikethroughS },
    ],
    [
        { id: 5, format: 'color', type: 'color-picker' },
        { id: 6, format: 'link', type: 'link' },
        { id: 7, format: 'link-remove', type: 'link-remove' },
    ],
    [
        { id: 8, format: 'orderedList', type: 'block', icon: MdFormatListNumbered },
        { id: 9, format: 'unorderedList', type: 'block', icon: MdFormatListBulleted },
    ],
    [
        { id: 10, format: 'alignLeft', type: 'block', icon: MdFormatAlignLeft },
        { id: 11, format: 'alignCenter', type: 'block', icon: MdFormatAlignCenter },
        { id: 12, format: 'alignRight', type: 'block', icon: MdFormatAlignRight },
    ],
    [
        { id: 13, format: 'image', type: 'image', icon: FaImage },
        { id: 14, format: 'table', type: 'table' },
        { id: 15, format: 'inTable', type: 'inTable' }
    ],
];