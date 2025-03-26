import { useMemo } from "react";
import { DateTime } from "luxon";
import _ from "lodash";
import { AppColumnDef } from "../types";
import { getLabel } from "../utils";
import { Node } from "slate";

interface UseTranslatedColumnsArgs {
    columns: any[];
    schema: any;
    entity: string;
    columnSizing: Record<string, number>;
}

export const useTranslatedColumns = ({
    columns,
    schema,
    entity,
    columnSizing,
}: UseTranslatedColumnsArgs): AppColumnDef<any, any>[] => {
    return useMemo(() => {
        return columns.map((c): AppColumnDef<any, any> => {
            const columnKey = typeof c === "string" ? c : c.field;
            const schemaField = schema?.[entity]?.fields?.[columnKey];

            const isNested = columnKey.includes(".");
            const ids = columnKey.split(".");
            const label = isNested
                ? getLabel({ entity, field: columnKey, schema })
                : schemaField?.label || columnKey;

            const accessorKey = isNested ? ids[0] : columnKey;
            const nestedKey = isNested ? ids.slice(1).join(".") : "";

            return {
                id: columnKey,
                header: label,
                accessorKey,
                enableResizing: true,
                size: columnSizing?.[columnKey] ?? 200,
                minSize: 50,
                meta: {
                    type: schemaField?.type,
                },
                cell: (info) => {
                    const val = info.getValue();

                    if (schemaField?.type === "datetime" && !isNested) {
                        return DateTime.fromISO(val).toFormat("dd.MM.yyyy HH:mm:ss");
                    }

                    if (schemaField?.type === "richtext" && val) {
                        try {
                            return Node.string({ children: val });
                        } catch {
                            return <span>-</span>;
                        }
                    }
                    
                    if (isNested) {
                        if (Array.isArray(val)) {
                            return <span>{val.map((v) => _.get(v, nestedKey)).join(", ")}</span>;
                        } else if (typeof val === "object") {
                            return <span>{_.get(val, nestedKey)}</span>;
                        }
                    }

                    return <span>{val}</span>;
                },
            };
        });
    }, [columns, schema, entity, columnSizing]);
};