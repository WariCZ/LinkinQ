export type EntitySchema = Record<string, EntityType>;

export type EntityType = {
  system?: boolean;
  withoutDefaultFields?: boolean;
  workflow?: boolean;
  fields: Record<string, FieldType>;
};
export type FieldType = {
  type?: string;
  label?: string;
  name?: string;
  description?: string;
  isRequired?: boolean;
  default?: string;
  isRelation?: string;
  isArray?: boolean;
  isUnique?: boolean;
  readonly?: boolean;
  system?: boolean;
};

export type DbSchemaType = { tables: EntitySchema; foreignKeys: string[] };
