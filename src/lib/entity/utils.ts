import { defaultFields, workflowFields } from "./defaultEntities";
import { DbSchemaType, EntitySchema, EntityType, FieldType } from "./types";
import _ from "lodash";

export const addDefaultFields = (schemaDefinition: EntitySchema) => {
  // Add default fields to definition
  _.mapKeys(schemaDefinition, (obj, k) => {
    const fields = obj.fields;
    if (obj.withoutDefaultFields) return;

    _.mapKeys(defaultFields(k), function (fieldDef, name) {
      if (!fields[name]) {
        fields[name] = fieldDef;
      }
    });

    if (obj.workflow) {
      _.mapKeys(workflowFields(), function (fieldDef, name) {
        if (!fields[name]) {
          fields[name] = fieldDef;
        }
      });
    }
  });

  return schemaDefinition;
};

export const translateDataTypesDBtoSchema = ({
  type,
  entity,
  column_name,
  entityDef,
}: {
  type: string;
  entity: string;
  column_name: string;
  entityDef: EntitySchema;
}) => {
  if (type === "character varying" && column_name == "password") {
    return "password";
  }

  if (type === "character varying") {
    return "text";
  }

  if (type === "timestamp with time zone") {
    return "datetime";
  }

  if (type === "integer" && column_name == "id") {
    return "bigint";
  }

  if (type === "bigint") {
    const type =
      entityDef[entity] && entityDef[entity].fields[column_name].type;
    if (type && type.indexOf("link(") > -1) {
      return entityDef[entity].fields[column_name].type;
    }
    return "bigint";
  }

  return type;
};

export const translateDefaultDBtoSchema = (column_default: string) => {
  if (column_default == "CURRENT_TIMESTAMP") {
    return "now()";
  }

  if (column_default == "uuid_generate_v4()") {
    return undefined;
  }

  return column_default;
};

export const findDifferences = (
  actual: DbSchemaType,
  schema: Record<string, EntityType>
): Record<string, EntityType> => {
  const differences: Record<string, EntityType> = {};

  //
  // Projdeme všechny tabulky v actualDBSchema
  for (const tableName in schema) {
    if (_.has(actual.tables, tableName)) {
      // Porovnáme sloupce v tabulce

      const obj1 = schema[tableName].fields;
      const obj2: any = actual.tables[tableName].fields;
      _.forEach(obj1, (value, key) => {
        // if (value.type && value.type.indexOf("nlink(") > -1) {
        //   return;
        // }
        if (!_.has(obj2, key)) {
          if (!differences[tableName]) differences[tableName] = { fields: {} };
          differences[tableName].fields[key] = value;
        } else {
          const diff = _.omitBy(value, (v, attr) =>
            _.isEqual(v, obj2[key][attr] as any)
          );
          if (!_.isEmpty(diff)) {
            // differences[key] = diff;
            if (!differences[tableName])
              differences[tableName] = { fields: {} };
            differences[tableName].fields[key] = { ...diff } as any;
          }
        }
      });
    } else {
      // Tabulka v schemaDefinition neexistuje v actualDBSchema
      differences[tableName] = schema[tableName];
    }
  }

  return differences;
};

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
