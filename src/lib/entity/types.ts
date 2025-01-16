export type EntitySchema = Record<string, EntityType>;

export type Rule =
  | { type: "field"; filter: Record<string, string | number> }
  | { type: "role"; roles: string[]; filter: Record<string, string | number> };

export type EntityType = {
  system?: boolean;
  withoutDefaultFields?: boolean;
  journal?: boolean;
  workflow?: boolean;
  nlinkTables?: { table: string; field: string }[];
  fields: Record<string, FieldType>;
  permissions?: {
    get?: {
      default: boolean;
      rules: Rule[];
    };
  };
};
export type FieldType = {
  type: string;
  label?: string;
  name?: string;
  description?: string;
  isRequired?: boolean;
  default?: string | number;
  isRelation?: string;
  isArray?: boolean;
  isUnique?: boolean;
  readonly?: boolean;
  system?: boolean;
  nlinkTable?: string;
  link?: string;
};

export type DbSchemaType = { tables: EntitySchema; foreignKeys: string[] };
