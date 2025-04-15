import { EntitySchema } from "../../../../lib/entity/types";
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
