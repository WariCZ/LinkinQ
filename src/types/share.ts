export type PageflowType = PageflowRecord | Record<"_public", PageflowRecord>;

export type PageflowRecord = Record<string, PageflowItemType | string>;
export type PageflowRecordClient = Record<string, PageflowItemTypeClient>;

export type PageflowItemType = {
  to?: string;
  componentPath?: string;
  source?: string;
  noLayout?: boolean;
  sidebar?: string;
};

export type PageflowItemTypeClient = PageflowItemType & {
  path?: string;
  children?: PageflowRecordClient;
};

export type AggregateType = {
  type: "sum" | "avg" | "max" | "min" | "count";
  field: string;
  alias?: string;
};
