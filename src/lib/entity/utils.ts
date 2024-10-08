import { defaultFields } from "./defaultEntities";
import { EntitySchema, EntityType, FieldType } from "./types";
import _ from "lodash";

export const addDefaultFields = (schemaDefinition: EntitySchema) => {
  // Add default fields to definition
  _.mapKeys(schemaDefinition, ({ fields }, k) => {
    _.mapKeys(defaultFields(k), function (fieldDef, name) {
      if (!fields[name]) {
        fields[name] = fieldDef;
      }
    });
  });

  return schemaDefinition;
};

export const translateDataTypesDBtoSchema = (
  type: string,
  entity: string,
  column_name: string
) => {
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
    return "bigIncrements";
  }

  if (type === "bigint") {
    const fields = defaultFields(entity);

    if (fields[column_name] && fields[column_name].type) {
      return fields[column_name].type;
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
    return "now()";
  }

  return column_default;
};

export const findDifferences = (
  actual: Record<string, EntityType>,
  schema: Record<string, EntityType>
): Record<string, EntityType> => {
  const differences: Record<string, EntityType> = {};

  //
  // Projdeme všechny tabulky v actualDBSchema
  for (const tableName in schema) {
    if (_.has(actual, tableName)) {
      // Porovnáme sloupce v tabulce

      const obj1 = schema[tableName].fields;
      const obj2: any = actual[tableName].fields;
      _.forEach(obj1, (value, key) => {
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
            differences[tableName].fields[key] = { ...diff };
          }
        }
      });

      // const tableDifferences = _.omitBy(
      //   schema[tableName].fields,
      //   (column, columnName) => {
      //     const ret = _.isEqual(column, actual[tableName].fields[columnName]);
      //     if (!ret) {
      //       console.log(columnName);
      //       console.log(JSON.stringify(column));
      //       console.log(JSON.stringify(actual[tableName].fields[columnName]));
      //       //debugger;
      //     }
      //     return ret;
      //   }
      // );

      // if (!_.isEmpty(tableDifferences)) {
      //   if (!differences[tableName]) differences[tableName] = { fields: {} };
      //   differences[tableName].fields = tableDifferences;
      // }
    } else {
      // Tabulka v schemaDefinition neexistuje v actualDBSchema
      differences[tableName] = schema[tableName];
    }
  }

  return differences;
};
