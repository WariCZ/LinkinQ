import { EntitySchema } from "@/lib/entity/types";
import { TableFieldType } from "../types";
import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import _ from "lodash";

interface GetLabelArgs {
    field: string;
    schema: EntitySchema;
    entity: string;
}

export const getLabel = ({ field, schema, entity }: GetLabelArgs): string => {
    const ids = field.split(".");
    const label: string[] = [];

    ids.forEach((id) => {
        const fieldDef = schema[entity]?.fields?.[id];
        if (!fieldDef) return;
        label.push(fieldDef.label);
        entity = fieldDef.link;
    });

    return label.join("/");
};

interface TranslateColumnsArgs {
    columns: TableFieldType[];
    schema?: EntitySchema;
    entity?: string;
    columnSizing: Record<string, number>
}

export const translateColumns = ({
    columns,
    schema,
    entity,
    columnSizing,
}: TranslateColumnsArgs): ColumnDef<any, any>[] => {
    return columns.map((c): ColumnDef<any, any> => {
        const columnKey = typeof c === "string" ? c : c.field;
        const schemaField = schema?.[entity!]?.fields?.[columnKey];

        const isNested = columnKey.includes(".");
        const ids = columnKey.split(".");
        const label = isNested
            ? getLabel({ entity: entity!, field: columnKey, schema: schema! })
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
            cell: (info) => {
                const val = info.getValue();

                if (schemaField?.type === "datetime" && !isNested) {
                    return DateTime.fromISO(val).toFormat("dd.MM.yyyy HH:mm:ss");
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
};