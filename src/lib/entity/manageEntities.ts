import { Knex } from "knex";
import logger from "../logger";
import { EntitySchema, FieldType } from "./types";
import { db } from ".";
import {
  defaultData,
  defaultEntities,
  defaultExecute,
  defaultFields,
  isSystemEntity,
} from "./defaultEntities";
import _ from "lodash";

declare global {
  var prodigi: {
    entityModel: EntitySchema;
  };
}

const translateDataTypesDBtoSchema = (
  type: string,
  entity: string,
  column_name: string
) => {
  if (type === "character varying") {
    return "text";
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

async function createData({ db, data }: { db: Knex; data: Object }) {
  _.mapKeys(data, async (dataArray: any, name) => {
    dataArray.map(async (d: any) => {
      var rows = await db(name).select().where("guid", d.guid);
      if (rows.length === 0) {
        await db(name).insert([d]);
      }
    });
  });

  await db("users").insert([
    { caption: "user1", fullname: "user1", createdby: 1, updatedby: 1 },
    { caption: "user2", fullname: "user2", createdby: 1, updatedby: 1 },
  ]);
  await db("users")
    .update({ caption: "user1 Update" })
    .where({ caption: "user1" });

  await db("users")
    .where({ caption: "user1 Update" })
    .orWhere({ caption: "user2" })
    .delete();
}

export async function createEntity({ entityName }: { entityName: string }) {
  const entityDef = addDefaultFields({ [entityName]: { fields: {} } });
  await createTable({
    db,
    tableName: entityName,
    tableFields: entityDef[entityName].fields,
  });

  global.prodigi.entityModel[entityName] = entityDef[entityName];

  return entityDef;
}

export async function deleteEntity({ entityName }: { entityName: string }) {
  if (!isSystemEntity(entityName)) {
    var deleted = await deleteTable({
      db,
      tableName: entityName,
    });

    if (deleted) {
      delete global.prodigi.entityModel[entityName];
    }
    return deleted;
  } else {
    return false;
  }
}

export async function deleteTable({
  db,
  tableName,
}: {
  db: Knex;
  tableName: string;
}) {
  // Zjistim zda tabulka existuje
  if (await db.schema.hasTable(tableName)) {
    await db.schema.dropTable(tableName);
    logger.log("info", `Tabulka ${tableName} smazaná.`);
    return true;
  } else {
    logger.log("info", `Tabulka ${tableName} neexistuje.`);
    return false;
  }
}

export async function createFieldTable({
  tableName,
  fieldName,
  fieldType,
}: {
  tableName: string;
  fieldName: string;
  fieldType: string;
}) {
  await createTable({
    db,
    tableName,
    tableFields: {
      [fieldName]: {
        label: fieldName,
        type: fieldType,
      },
    },
  });
}

export async function createField({
  tableName,
  columnName,
  columnDef,
}: {
  tableName: string;
  columnName: string;
  columnDef: FieldType;
}) {
  const MAIN_ID = "id";
  //   console.log("columnName: ", columnName);
  if (await db.schema.hasColumn(tableName, columnName)) {
    // logger.log(
    //   "info",
    //   `  Sloupec ${columnName} již existuje v tabulce ${tableName}.`
    // );
  } else {
    // const columnDef = fields[columnName];

    await db.schema.alterTable(tableName, async (table: any) => {
      let column;
      if (columnDef.type == "text") {
        column = table.text(columnName);
      } else if (columnDef.type == "integer") {
        column = table.integer(columnName);
      } else if (columnDef.type == "uuid") {
        column = table.uuid(columnName).defaultTo(db.raw("uuid_generate_v4()"));
      } else if (columnDef.type == "biginteger") {
        column = table.bigInteger(columnName);
      } else if (columnDef.type == "datetime") {
        column = table.datetime(columnName);
      } else if (columnDef.type == "json") {
        column = table.json(columnName);
      } else if (columnDef.type == "boolean") {
        column = table.boolean(columnName);
      } else if (columnDef.type == "bigIncrements") {
        column = table.bigIncrements(columnName);
      } else if (columnDef.type == "password") {
        column = table.string(columnName);
      } else if (columnDef.type.match(/^link\(\w+\)$/)) {
        column = table.bigInteger(columnName);
        const rel = columnDef.type.match(/^nlink\((\w+)\)$/);
        if (rel) {
          table
            .foreign(columnName)
            .references(columnDef.isRelation + "." + MAIN_ID);
        } else {
          logger.log(
            "info",
            `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ link ${columnDef.type}.`
          );
        }
      } else if (columnDef.type.match(/^nlink\(\w+\)$/)) {
        const rel = columnDef.type.match(/^nlink\((\w+)\)$/);
        if (rel) {
          if (
            !(await db.schema.hasTable(
              tableName + "2" + rel[1] + "4" + columnName
            ))
          ) {
            await db.schema.createTable(
              tableName + "2" + rel[1] + "4" + columnName,
              (table: any) => {
                table.bigIncrements(MAIN_ID).primary();
                table.bigint("source");
                table.bigint("target");

                table.foreign("source").references(tableName + "." + MAIN_ID);
                //TODO: musi se provest az uplne na konci Conclusion nema taky :-)
                // table
                //   .foreign("target")
                //   .references(columnDef.isRelation + ".id");
              }
            );
          } else {
            logger.log(
              "info",
              `Tabulka ${
                tableName + "2" + rel[1] + "4" + columnName
              } již existuje.`
            );
          }
        } else {
          logger.log(
            "info",
            `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ nlink ${columnDef.type}.`
          );
        }
      } else {
        logger.log(
          "info",
          `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ ${columnDef.type}.`
        );
      }
      //   console.log("DDD", columnName, MAIN_ID);
      if (column && columnName == MAIN_ID) {
        // console.log("TUX");
        column.primary();
      }
      if (column && columnDef.isUnique) {
        column.unique({
          indexName: columnName + "_ukey",
        });
      }
      if (column && columnDef.isRequired) {
        column.notNullable();
      }

      if (column && columnDef.default) {
        if (columnDef.default == "now()") {
          column.defaultTo(db.fn.now());
        }
      }
    });
    logger.log(
      "info",
      `  Sloupec ${columnName} byl vytvořen v tabulce ${tableName}.`
    );
  }
}

export async function createTable({
  db,
  tableName,
  tableFields,
}: {
  db: Knex;
  tableName: string;
  tableFields?: Record<string, FieldType>;
}) {
  const MAIN_ID = "id";
  // Zjistim zda tabulka existuje
  if (!(await db.schema.hasTable(tableName))) {
    await db.schema.createTable(tableName, async (table) => {
      // nastavim defaultni sloupce
      table.increments(MAIN_ID);
      table.primary([MAIN_ID]);
    });
    logger.log("info", `Tabulka ${tableName} vytvořena.`);
  } else {
    logger.log("info", `Tabulka ${tableName} již existuje.`);
  }

  const fields = {
    ...defaultFields(tableName),
    ...tableFields,
  };

  // Zacnu pridavat sloupce
  for (const columnName in fields) {
    await createField({
      tableName,
      columnName: columnName,
      columnDef: fields[columnName],
    });
  }
}

async function createTables({
  db,
  schemaDefinition,
}: {
  db: Knex;
  schemaDefinition: EntitySchema;
}) {
  for (const tableName in schemaDefinition) {
    await createTable({
      db,
      tableName,
      tableFields: schemaDefinition[tableName].fields,
    });
  }
}

async function getTablesAndColumns(db: Knex) {
  try {
    const tableData = await db
      .select(
        "table_name",
        "column_name",
        "data_type",
        "character_maximum_length",
        "is_nullable",
        "column_default"
      )
      .from("information_schema.columns")
      .where("table_schema", "public"); // Pokud používáte schéma, upravte podle potřeby

    const tables: EntitySchema = {}; // Objekt pro ukládání tabulek a jejich sloupců

    for (const row of tableData) {
      const {
        table_name,
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
      } = row;

      if (!tables[table_name]) {
        tables[table_name] = { fields: {} };
      }

      const foreignKeys = await db
        .select("constraint_name")
        .from("information_schema.key_column_usage")
        .where("table_schema", "public") // Změňte podle potřeby
        .where("table_name", table_name)
        .where("column_name", column_name);

      const foreignKeyInfo = foreignKeys.length > 0 ? foreignKeys[0] : null;

      let referencedtableName;
      if (foreignKeyInfo) {
        // Získat název tabulky, na kterou odkazuje cizí klíč
        const referencedTable = await db
          .select("unique_constraint_name")
          .from("information_schema.referential_constraints")
          .where("constraint_name", foreignKeyInfo.constraint_name)
          .andWhere("constraint_schema", "public"); // Změňte podle potřeby

        referencedtableName =
          referencedTable.length > 0
            ? referencedTable[0].unique_constraint_name
            : null;
      }

      tables[table_name].fields[column_name] = {
        name: column_name,
        type: translateDataTypesDBtoSchema(data_type, table_name, column_name),
        ...(is_nullable == "NO" ? { isRequired: is_nullable == "NO" } : {}),
        ...(column_default ? { default: column_default } : {}),
        ...(referencedtableName ? { isRelation: referencedtableName } : {}),
        ...(character_maximum_length ? character_maximum_length : {}),
        // "isList": false,
        // "isRelation": false
        // is_nullable,
        // column_default,
      };
    }
    // console.log("tables");
    // console.log(tables);
    return tables;
  } catch (error) {
    console.error("Chyba při získávání tabulek a sloupců", error);
  }
}

function findDifferences(
  actual: Record<string, any>,
  schema: Record<string, any>,
  defaultColumns: string[]
) {
  const differences: Record<string, any> = {};

  //
  // Projdeme všechny tabulky v actualDBSchema
  for (const tableName in schema) {
    if (_.has(actual, tableName)) {
      // Porovnáme sloupce v tabulce
      const tableDifferences = _.omitBy(
        schema[tableName],
        (column, columnName) => {
          const ret =
            _.isEqual(column, actual[tableName][columnName]) ||
            defaultColumns.indexOf(columnName) > -1;

          //   if (!ret) {
          //     console.log(
          //       "--------",
          //       tableName,
          //       columnName,
          //       column,
          //       actual[tableName][columnName]
          //     );
          //   }
          return ret;
        }
      );

      if (!_.isEmpty(tableDifferences)) {
        differences[tableName] = tableDifferences;
      }
    } else {
      // Tabulka v schemaDefinition neexistuje v actualDBSchema
      differences[tableName] = schema[tableName];
    }
  }

  return differences;
}

export const checkSchema = async (force?: string) => {
  if (!global.prodigi || force) {
    const schema = await prepareSchema(db, [defaultEntities()]);

    global.prodigi = {
      entityModel: schema,
    };

    return schema;
  } else {
    return global.prodigi.entityModel;
  }
};

const addDefaultFields = (schemaDefinition: EntitySchema) => {
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

export const prepareSchema = async (
  db: Knex,
  schemaDefinitions: EntitySchema[],
  config?: { dropTables?: boolean }
): Promise<EntitySchema> => {
  const exec = defaultExecute();

  console.log("DB Run Raw");
  await exec.map(async (e) => {
    console.log("DB Raw begin");
    const x = await db.raw(e);
    console.log("DB Raw End", x);
  });

  console.log("DB Finish Raw");

  //TODO: spravne zmergovat DB a schema
  const actualDBSchema: any = await getTablesAndColumns(db);

  const schemaDefinition = schemaDefinitions[0];

  const entityDef = addDefaultFields(schemaDefinition);

  const differencesAdd = findDifferences(actualDBSchema, entityDef, []);

  await createTables({ db, schemaDefinition: differencesAdd });

  await createData({ db, data: defaultData() });
  //   console.log("differences");
  //   console.log(JSON.stringify(differences));

  for (const tableName in actualDBSchema) {
    if (isSystemEntity(tableName)) {
      actualDBSchema[tableName].system = true;
    }
  }

  return actualDBSchema;
  //   logger.log("info", "Start prepare schema");
  //   const actualDBSchema: any = await getTablesAndColumns(db);

  //   console.log("differencesDelete", differencesDelete);
  //   const differencesCreate = findDifferences(
  //     actualDBSchema,
  //     schemaDefinitions[0],
  //     [MAIN_ID]
  //   );
  //   // dropTables

  //   console.log("differencesCreate", differencesCreate);
  //   await createTables({ db, schemaDefinition: differencesCreate });
  //   logger.log("info", "Finish prepare schema");

  //   return schemaDefinitions[0];
};
