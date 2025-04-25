import { FieldPrimitiveType } from "../../../lib/entity/types";
import { CellContext, ColumnDef } from "@tanstack/react-table";

export type TableFieldType =
  | {
      field: string;
      label?: string;
      className?: string;
      cell?: ({ getValue }: CellContext<any, unknown>) => string;
      size?: number;
      maxSize?: number;
    }
  | string;

export type TableOrdering = {
  id: string;
  desc?: boolean;
};

interface AppColumnMeta {
  type: FieldPrimitiveType;
}

export type AppColumnDef<TData = any, TValue = any> = ColumnDef<
  TData,
  TValue
> & {
  accessorKey: string;
  meta: AppColumnMeta;
};
