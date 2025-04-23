import { FieldType } from "../../../../lib/entity/types";

export const getFieldName = (field: FieldType): string =>
  field.name ?? field.type;
