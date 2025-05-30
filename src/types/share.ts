export type PageflowType = PageflowRecord | Record<"public", PageflowRecord>;

export type PageflowRecord = Record<string, PageflowItemType | string>;
export type PageflowRecordClient = Record<string, PageflowItemTypeClient>;

export type PageflowItemType = {
  to?: string;
  componentPath?: string;
  children?: PageflowRecord;
  noLayout?: boolean;
  sidebar?: string;
};

export type PageflowItemTypeClient = PageflowItemType & {
  path?: string;
  children?: PageflowRecordClient;
};
