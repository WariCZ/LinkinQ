import { useMemo } from "react";
import { ElementProps } from "../../types";

const allowedSchemes = ["http:", "https:", "mailto:", "tel:"];

const InlineChromiumBugfix = () => (
    <span contentEditable={false}>{String.fromCodePoint(160)}</span>
);

export const Link = ({ attributes, children, element }: ElementProps) => {

    const safeUrl = useMemo(() => {
        let parsedUrl: URL | null = null;
        try {
            parsedUrl = new URL(element.url);
        } catch { }

        if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
            return parsedUrl.href;
        }
        return "about:blank";
    }, [element.url]);

    return (
        <a
            {...attributes}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-blue-500 underline transition-colors `}
        >
            <InlineChromiumBugfix />
            {children}
            <InlineChromiumBugfix />
        </a>
    );
};
