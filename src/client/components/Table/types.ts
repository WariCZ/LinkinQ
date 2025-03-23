import { CellContext } from "@tanstack/react-table";

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

