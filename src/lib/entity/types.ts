export type EntitySchema = Record<string, EntityType>;
export type DBSchema = Record<string, EntityType<DBFieldType>>;

export type Rule =
  | { type: "field"; filter: Record<string, string | number> }
  | { type: "role"; roles: string[]; filter: Record<string, string | number> };

export type EntityType<T = FieldType> = {
  sequencesFields?: string[];
  system?: boolean;
  withoutDefaultFields?: boolean;
  journal?: boolean;
  workflow?: boolean;
  nlinkTables?: { table: string; field: string }[];
  fields: Record<string, T>;
  permissions?: {
    get?: {
      default: boolean;
      rules: Rule[];
    };
  };
};
export type FieldPrimitiveType =
  | "uuid"
  | "richtext"
  | "jsonb"
  | "boolean"
  | "password"
  | "decimal"
  | "blob"
  | "text"
  | "bigint"
  | "integer"
  | "datetime"
  | `link(${string})`
  | `nlink(${string})`
  | `lov(${string})`
  | `nlov(${string})`;

export type FieldType = {
  type: FieldPrimitiveType;
  label?: string;
  name?: string;
  description?: string;
  isRequired?: boolean;
  default?: string | number | boolean;
  isRelation?: string;
  isArray?: boolean;
  isUnique?: boolean;
  readonly?: boolean;
  system?: boolean;
  nlinkTable?: string;
  link?: string;
  lov?: string;
  seqformat?: string;
};

export type DBFieldType = {
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
  lov?: string;
};

export type DbSchemaType = { tables: DBSchema; foreignKeys: string[] };
