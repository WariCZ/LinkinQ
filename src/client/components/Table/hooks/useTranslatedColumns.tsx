import { useMemo } from "react";
import { DateTime } from "luxon";
import _ from "lodash";
import { AppColumnDef } from "../types";
import { getLabel } from "../utils";
import { Node } from "slate";
import useStore from "../../../../../src/client/store";

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
  const profileSettings = useStore(
    (state) => state.userConfigurations["profileSettings"]?.definition ?? {}
  );
  const dateFormat = profileSettings.dateFormat || "dd.MM.yyyy HH:mm:ss";

  return useMemo(() => {
    return [
      {
        id: 'expander',
        accessorKey: 'expander',
        header: () => null,
        size: 30,
        minSize: 30,
        enableResizing: false,
      },
      ...columns.map((c): AppColumnDef<any, any> => {
        if (typeof c !== "string" && c.cell) {
          return {
            ...c,
            header: c.label ?? c.field ?? c.id,
            id: c.id ?? c.field,
            size: columnSizing?.[c.field] ?? 200,
            minSize: 50,
            enableResizing: true,
          };
        }

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
              return val ? DateTime.fromISO(val).toFormat(dateFormat) : "-";
            }

            if (schemaField?.type === "richtext" && val) {
              try {
                return Node.string({ children: val });
              } catch {
                return <span>-</span>;
              }
            }

            if (isNested) {
              const nestedVal = _.get(val, nestedKey);
              if (Array.isArray(val)) {
                return (
                  <span>
                    {val
                      .map((v) => {
                        const nested = _.get(v, nestedKey);
                        return typeof nested === "object"
                          ? JSON.stringify(nested)
                          : String(nested ?? "-");
                      })
                      .join(", ")}
                  </span>
                );
              } else if (typeof nestedVal === "object" && nestedVal !== null) {
                return (
                  <pre className="whitespace-nowrap text-xs">
                    {JSON.stringify(nestedVal)}
                  </pre>
                );
              } else {
                return <span>{String(nestedVal ?? "-")}</span>;
              }
            }

            if (typeof val === "object" && val !== null) {
              return (
                <pre className="whitespace-nowrap text-xs">
                  {JSON.stringify(val, null, 2)}
                </pre>
              );
            }

            return <span>{String(val ?? "-")}</span>;
          },
        };
      }),
    ];
  }, [columns, schema, entity, columnSizing, dateFormat]);
};
