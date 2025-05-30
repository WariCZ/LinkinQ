import { Knex } from "knex";
import _ from "lodash";
import {
  DbSchemaType,
  DBFieldType,
  EntitySchema,
  EntityType,
  FieldType,
} from "./types";
import { db as knexDB } from "../knex";
import {
  addDefaultFields,
  findDifferences,
  translateDefaultDBtoSchema,
  translateDataTypesDBtoSchema,
  wait,
} from "./utils";

import logger from "../logger";
import EventEmitter from "events";
import { Sql } from "./sql";
import { TriggerItemInternalType, Triggers } from "./triggers";
import { debug } from "console";
import { console } from "inspector";

export class Entity {
  db: Knex;
  MAIN_ID: string = "id";
  GUID_ID: string = "guid";
  schema: EntitySchema = {};
  eventsOnEntities: EventEmitter;
  triggers: Triggers;

  constructor() {
    this.db = knexDB();
    this.eventsOnEntities = new EventEmitter();
    this.triggers = new Triggers({
      db: this.db,
      eventsOnEntities: this.eventsOnEntities,
    });
  }

  defaultExecute = () => {
    return ['CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'];
  };

  async resetPublicSchema() {
    try {
      await this.db.raw(`DROP SCHEMA public CASCADE`).setUser({ id: 1 });
      await this.db.raw(`CREATE SCHEMA public`).setUser({ id: 1 });
      console.log("Schema public bylo úspěšně resetováno.");
    } catch (error) {
      console.error("Chyba při resetování schematu public:", error);
    }
  }

  async getTablesAndColumns(entityDef: EntitySchema) {
    try {
      const tableData = await this.db
        .select(
          "table_name",
          "column_name",
          "data_type",
          "character_maximum_length",
          "is_nullable",
          "column_default"
        )
        .setUser({ id: 1 })
        .from("information_schema.columns")
        .where("table_schema", "public")
        .orderBy(["table_name", "column_name"]);

      const dbSchema: DbSchemaType = {
        tables: {},
        foreignKeys: [],
      };

      for (const row of tableData) {
        const {
          table_name,
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default,
        } = row;

        if (!dbSchema.tables[table_name]) {
          dbSchema.tables[table_name] = { fields: {} };
        }

        const foreignKeys = await this.db
          .select("constraint_name")
          .setUser({ id: 1 })
          .from("information_schema.key_column_usage")
          .where("table_schema", "public")
          .where("table_name", table_name)
          .where("column_name", column_name)
          .orderBy(["table_name", "column_name"]);

        const foreignKeyInfo = foreignKeys.length > 0 ? foreignKeys[0] : null;

        let foreignTable;
        if (
          foreignKeyInfo &&
          foreignKeyInfo.constraint_name.indexOf("_foreign") > -1
        ) {
          dbSchema.foreignKeys.push(foreignKeyInfo.constraint_name);

          const constraint_name = foreignKeyInfo.constraint_name;

          const foreignTableRows = await this.db
            .select("table_name")
            .setUser({ id: 1 })
            .from("information_schema.constraint_column_usage")
            .where("table_schema", "public")
            .where("constraint_name", constraint_name);

          foreignTable =
            foreignTableRows.length > 0 ? foreignTableRows[0].table_name : null;
        }

        const desc_result = await this.db
          .raw(
            `SELECT col_description(?::regclass::oid,
      (SELECT attnum FROM pg_attribute
       WHERE attname = ? AND attrelid = ?::regclass))`,
            [`"${table_name}"`, `"${column_name}"`, `"${table_name}"`]
          )
          .setUser({ id: 1 });

        // if (column_name == "guid") debugger;

        dbSchema.tables[table_name].fields[column_name] = {
          label:
            entityDef[table_name]?.fields[column_name]?.label || column_name,
          type: translateDataTypesDBtoSchema({
            type: data_type,
            entity: table_name,
            column_name,
            entityDef,
            foreignTable,
          }),
          ...(desc_result.rows[0].col_description
            ? { description: desc_result.rows[0].col_description }
            : {}),
          ...(is_nullable ? { isRequired: is_nullable === "NO" } : {}),
          ...(column_default
            ? { default: translateDefaultDBtoSchema(column_default) }
            : {}),
          // ...(referencedtableName ? { isRelation: referencedtableName } : {}),
          // ...(character_maximum_length ? character_maximum_length : {}),
          ...(entityDef[table_name]?.fields[column_name]?.system
            ? { system: true }
            : {}),
          ...(foreignTable ? { link: foreignTable } : {}),
          // "isList": false,
          // "isRelation": false
          // is_nullable,
          // column_default,
        };
      }

      return dbSchema;
    } catch (error) {
      throw error;
    }
  }

  async createFields({
    tableName,
    fields,
    actualDBSchema,
  }: {
    tableName: string;
    fields: Record<string, FieldType>;
    actualDBSchema?: DbSchemaType;
  }) {
    const foreignKeys = [];
    const createLinkTables = [];

    for (const columnName in fields) {
      const columnDef = fields[columnName];
      if (columnName == this.MAIN_ID) {
        continue;
      }

      let columnExists = false;
      let actualDBColumn: DBFieldType | undefined;

      // if (columnName == "id") debugger;
      if (
        await this.db.schema.setUser({ id: 1 }).hasColumn(tableName, columnName)
      ) {
        columnExists = true;
        actualDBColumn = actualDBSchema?.tables[tableName]?.fields[columnName];
      }

      let column: Knex.ColumnBuilder | undefined = undefined;

      if (
        columnExists &&
        columnDef.type &&
        actualDBColumn &&
        actualDBColumn?.type !== columnDef.type
      ) {
        logger.error(
          `Pretypovani sloupce ${columnName} v entite ${tableName} z typu ${actualDBColumn?.type} na typ ${columnDef.type} není možný.`
        );
        return;
      } else {
        if (columnExists) {
          // TODO: pretypovani
          // columnDef = { ...actualDBColumn, ...columnDef };
        }
      }

      await this.db.schema.setUser({ id: 1 }).alterTable(tableName, (table) => {
        //

        if (columnDef.type == "text") {
          column = table.text(columnName);
        } else if (columnDef.type == "integer") {
          column = table.integer(columnName);
        } else if (columnDef.type == "uuid") {
          column = table
            .uuid(columnName)
            .defaultTo(this.db.raw("uuid_generate_v4()"));
        } else if (columnDef.type == "bigint") {
          column = table.bigint(columnName);
        } else if (columnDef.type == "datetime") {
          column = table.datetime(columnName);
        } else if (columnDef.type == "richtext") {
          column = table.specificType(columnName, "jsonb[]");
        } else if (columnDef.type == "jsonb") {
          column = table.jsonb(columnName);
        } else if (columnDef.type == "boolean") {
          column = table.boolean(columnName);
        } else if (columnDef.type == "password") {
          column = table.string(columnName);
        } else if (columnDef.type == "blob") {
          column = table.specificType(columnName, "BYTEA");
        } else if (columnDef.type?.match(/^link\(\w+\)$/)) {
          if (columnDef.type.indexOf("wf_") > -1) {
            column = table.uuid(columnName);
          } else {
            column = table.bigint(columnName);
          }
          const rel = columnDef.type.match(/^link\((\w+)\)$/);

          if (rel) {
            // const foreignKey = rel[1] + "_" + columnName + "_foreign";
            // if (
            //   !actualDBSchema ||
            //   actualDBSchema?.foreignKeys.indexOf(foreignKey) == -1
            // ) {
            //   table.foreign(columnName).references(rel[1] + "." + this.MAIN_ID);
            // }

            foreignKeys.push({
              table: tableName,
              column: columnName,
              refTable: rel[1],
              refCol: this.MAIN_ID,
              onDelete: false,
            });
          } else {
            logger.info(
              `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ link ${columnDef.type}.`
            );
          }
        } else if (columnDef.type?.match(/^nlink\(\w+\)$/)) {
          // return;
          const rel = columnDef.type.match(/^nlink\((\w+)\)$/);
          if (rel) {
            const linkTable = `${tableName}2${rel[1]}4${columnName}`;

            createLinkTables.push({
              tableName: linkTable,
              sourceTable: tableName,
              targetTable: rel[1],
            });
          } else {
            logger.info(`Sloupec ${columnDef.type} je mimo regularni vyraz.`);
          }
        } else if (columnDef.type?.match(/^lov\(\w+\)$/)) {
          const rel = columnDef.type.match(/^lov\((\w+)\)$/);
          if (rel) {
            foreignKeys.push({
              table: tableName,
              column: columnName,
              refTable: "lov",
              // refTable: rel[1],
              refCol: this.MAIN_ID,
              onDelete: false,
            });

            column = table.bigint(columnName);
          } else {
            logger.info(
              `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ link ${columnDef.type}.`
            );
          }
        } else {
          logger.error(
            `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ ${columnDef.type}.`
          );
        }
        // } else {
        //   logger.error(
        //     `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ ${columnDef.type}.`
        //   );
        // }

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
            column.defaultTo(this.db.fn.now());
          } else {
            column.defaultTo(columnDef.default);
          }
        }

        if (column && columnDef.description) {
          column.comment(columnDef.description);
        }

        if (column && columnExists) {
          column.alter();
        }

        if (column) {
          if (columnExists) {
            logger.info(
              `  Sloupec ${columnName} byl upraven v tabulce ${tableName}.`
            );
          } else {
            logger.info(
              `  Sloupec ${columnName} (${columnDef.type}) byl vytvořen v tabulce ${tableName}.`
            );
          }
          //
        } else {
          if (columnDef.type?.indexOf("nlink(") == -1)
            logger.error(
              `  Sloupec ${columnName} pro tabulku ${tableName} nebyl vytvoren a ma prazdny column.`
            );
        }
      });
    }

    return { foreignKeys, createLinkTables };
  }

  async createForeignKeys({ table, foreignKeys, actualDBSchema }) {
    for (const fk of foreignKeys) {
      if (fk) {
        await this.db.schema.setUser({ id: 1 }).alterTable(table, (table) => {
          const foreignKey = fk.refTable + "_" + fk.column + "_foreign";
          console.log(`CREATE FK - "${foreignKey}"`);
          if (
            !actualDBSchema ||
            actualDBSchema?.foreignKeys.indexOf(foreignKey) == -1
          ) {
            table
              .foreign(fk.column)
              .references(fk.refTable + "." + this.MAIN_ID);
          }
        });
      }
    }
  }

  async deleteColumn({
    tableName,
    columnName,
  }: {
    tableName: string;
    columnName: string;
  }) {
    // Zjistím, zda tabulka existuje
    if (await this.db.schema.setUser({ id: 1 }).hasTable(tableName)) {
      // Zjistím, zda sloupec existuje
      const columnExists = await this.db.schema
        .setUser({ id: 1 })
        .hasColumn(tableName, columnName);
      if (columnExists) {
        if (!this.schema[tableName].fields[columnName].system) {
          await this.db.schema
            .setUser({ id: 1 })
            .alterTable(tableName, (table) => {
              table.dropColumn(columnName);
            });
          console.log(`Sloupec ${columnName} v tabulce ${tableName} smazaný.`);
          return true;
        } else {
          console.log(
            `Sloupec ${columnName} v tabulce ${tableName} je systemový.`
          );
          return false;
        }
      } else {
        console.log(`Sloupec ${columnName} v tabulce ${tableName} neexistuje.`);
        return false;
      }
    } else {
      console.log(`Tabulka ${tableName} neexistuje.`);
      return false;
    }
  }

  async deleteTable({ tableName }: { tableName: string }) {
    // Zjistim zda tabulka existuje
    if (await this.db.schema.setUser({ id: 1 }).hasTable(tableName)) {
      if (!this.schema[tableName].system) {
        await this.db.schema.setUser({ id: 1 }).dropTable(tableName);
        console.log(`Tabulka ${tableName} smazaná.`);
        return true;
      } else {
        console.log(`Tabulka ${tableName} je systémová`);
        return false;
      }
    } else {
      console.log(`Tabulka ${tableName} neexistuje.`);
      return false;
    }
  }

  async createTable({
    tableName,
    schemaDefinition,
  }: {
    tableName: string;
    schemaDefinition: EntitySchema;
  }) {
    try {
      //
      // Zjistim zda tabulka existuje
      if (!(await this.db.schema.setUser({ id: 1 }).hasTable(tableName))) {
        await this.db.schema
          .setUser({ id: 1 })
          .createTable(tableName, async (table) => {
            // nastavim defaultni sloupce
            // TODO: vyjimka pro BPMN
            //
            let column;
            // if (tableName.indexOf("wf_") > -1) {
            //   column = table.text(this.MAIN_ID);
            // } else {
            //TODO: Tenhle IF je blbe melo by se to predelat na to aby ID bylo jako ostatni
            // if (tableName === "wf_locks") {
            if (tableName.indexOf("wf_") > -1) {
              // column = table.text(this.MAIN_ID);
              table
                .uuid(this.MAIN_ID)
                .primary()
                .defaultTo(this.db.raw("gen_random_uuid()"));
            } else {
              column = table.bigIncrements(this.MAIN_ID);
              table.primary([this.MAIN_ID]);

              if (
                schemaDefinition[tableName].fields[this.MAIN_ID].description
              ) {
                column.comment(
                  schemaDefinition[tableName].fields[this.MAIN_ID]
                    .description || "ID record"
                );
              }
            }
          });
        logger.info(`Tabulka ${tableName} vytvořena.`);
      } else {
        // logger.info(`Tabulka ${tableName} již existuje.`);
      }
    } catch (e) {
      debugger;
    }
  }

  async createLinkTables({ linkTable }) {
    for (const lt of linkTable) {
      if (lt) {
        if (await this.db.schema.setUser({ id: 1 }).hasTable(lt.tableName)) {
          continue;
        }

        //if (!lt.table) debugger;
        await this.db.schema
          .setUser({ id: 1 })
          .createTable(lt.tableName, (table: any) => {
            table.bigIncrements(this.MAIN_ID).primary([this.MAIN_ID]);

            table.bigint("source");
            table.bigint("target");

            table
              .foreign("source")
              .references(lt.sourceTable + "." + this.MAIN_ID)
              .onDelete("CASCADE");
            //TODO: musi se provest az uplne na konci Conclusion nema taky :-)

            table
              .foreign("target")
              .references(lt.targetTable + "." + this.MAIN_ID)
              .onDelete("CASCADE");
          });
      }
    }
  }

  async createTables({
    schemaDefinition,
    actualDBSchema,
  }: {
    schemaDefinition: EntitySchema;
    actualDBSchema?: DbSchemaType;
  }) {
    //
    for (const tableName in schemaDefinition) {
      await this.createTable({
        tableName,
        schemaDefinition,
      });
    }

    const fieldsAdd = {};
    for (const tableName in schemaDefinition) {
      const fields = {
        ...schemaDefinition[tableName].fields,
      };
      // Zacnu pridavat sloupce
      logger.info(`Kontrola sloupcu pro tabulku ${tableName}`);
      // for (const columnName in fields) {
      fieldsAdd[tableName] = await this.createFields({
        tableName,
        fields,
        actualDBSchema: actualDBSchema,
      });
    }

    for (const tableName in schemaDefinition) {
      if (fieldsAdd[tableName]?.createLinkTables) {
        await this.createLinkTables({
          linkTable: fieldsAdd[tableName].createLinkTables,
        });
      }
    }

    return { fieldsAdd: fieldsAdd };
  }

  processDataObjects(input) {
    const orderEntities = [
      "users",
      "userroles",
      "lov",
      "wf_events",
      "wf_instances",
      "wf_locks",
      "wf_model",
      "journal",
      "attachments_history",
      "attachments",
      "triggers",
      "adapters",
      "notifications",
    ];

    const result = [];

    // Nejprve hodnoty podle poradi
    for (const key of orderEntities) {
      if (key in input) {
        result.push({ entity: key, data: input[key] });
      }
    }

    // Pak zbytek, který v poradi není
    for (const key in input) {
      if (!orderEntities.includes(key)) {
        result.push({ entity: key, data: input[key] });
      }
    }
    return result;
  }

  async createData({
    data,
    updateData,
    sqlAdmin,
  }: {
    data: Object;
    sqlAdmin: Sql;
    updateData: Object;
  }) {
    const sortedEnt = this.processDataObjects(data);

    for (const entData of sortedEnt) {
      for (const d of entData.data) {
        var rows = await sqlAdmin.select({
          entity: entData.entity,
          fields: [this.MAIN_ID],
          where: { guid: d.guid },
        });
        if (rows.length === 0) {
          await sqlAdmin.insert({
            entity: entData.entity,
            data: d,
          });
        }
      }
    }

    if (updateData) {
      for (const [name, dataArray] of Object.entries(updateData)) {
        for (const d of dataArray) {
          var rows = await sqlAdmin.select({
            entity: name,
            fields: [this.MAIN_ID],
            where: { guid: d.guid },
          });

          if (rows.length === 1) {
            await sqlAdmin.update({
              entity: name,
              data: d,
              where: { guid: d.guid },
            });
          } else {
            console.warn("NOt found");
          }
        }
      }
    }
  }

  getSchema() {
    return this.schema;
  }
  setSchema(schema: EntitySchema) {
    this.triggers.setSchema(schema);
    return (this.schema = schema);
  }
  //
  addEntityFieldsFromDB(
    schema: EntitySchema,
    diff: Record<string, EntityType>
  ) {
    Object.keys(diff).forEach((table) => {
      if (table.match(/\w+2\w+4\w+/gm)) {
        //nlink tables ignore
        return;
      }
      if (!schema[table]) {
        console.warn(`Entity ${table} not exist in schema`);
        schema[table] = { fields: {} };
      }
      Object.keys(diff[table].fields).forEach((f) => {
        if (!schema[table].fields[f]) {
          console.warn(`Entity ${table} field ${f} not exist in schema`);
          schema[table].fields[f] = diff[table].fields[f];
        }
      });
    });
    return schema;
  }

  addAttributesToSchema(schema: EntitySchema) {
    Object.keys(schema).forEach((table) => {
      Object.keys(schema[table].fields).forEach((f) => {
        if (schema[table]) {
          const relTable = schema[table].fields[f].type.match(
            /.*(?:link|lov)\((\w+)\)/
          );
          if (relTable) {
            const isNLink = relTable[0].indexOf("nlink(");
            if (isNLink > -1) {
              const nlinkTable = table + "2" + relTable[1] + "4" + f;
              schema[table].fields[f].nlinkTable = nlinkTable;
              schema[table].fields[f].link = relTable[1];

              const entity = schema[table];
              entity.nlinkTables = entity.nlinkTables || [];

              entity.nlinkTables.push({
                table: nlinkTable,
                field: f,
              });
            } else {
              const isLov = relTable[0].indexOf("lov(") > -1;
              if (isLov) {
                schema[table].fields[f].link = "lov";
                schema[table].fields[f].lov = relTable[1];
              } else {
                schema[table].fields[f].link = relTable[1];
              }
            }
          }
          if (schema[table].fields[f].seqformat) {
            if (!schema[table].sequencesFields) {
              schema[table].sequencesFields = [];
            }
            schema[table].sequencesFields.push(f);
          }
        }
      });
    });
    return schema;
  }

  async prepareSchema(
    { triggers, entities, defaultData, updateData }: any /*{
    triggers: TriggerItemInternalType[];
    schemaDefinition: EntitySchema;
  }*/
  ) {
    //
    if (process.env.e2etest == "true") {
      await this.resetPublicSchema();
    }

    await this.defaultExecute().map(async (e) => {
      await this.db.raw(e).setUser({ id: 1 });
    });
    // this.registerTriggers();

    // const schemaDefinition = defaultEntities();

    const entityDef = addDefaultFields(entities);

    // Dohledani tabulek a slopupcu ktere jsou ve Schematu a pridam je do DB
    const actualDBSchema = await this.getTablesAndColumns(entityDef);
    const differencesAdd = findDifferences(actualDBSchema, entityDef);

    console.log("Create tables");
    const { fieldsAdd } = await this.createTables({
      schemaDefinition: differencesAdd,
      actualDBSchema: actualDBSchema,
    });

    // Dohledani tabulek a slopupcu ktere jsou v DB ale chybi ve schematu
    const differencesFromDBToSchema = findDifferences(
      actualDBSchema,
      entityDef,
      true
    );
    const entityDefComplete = this.addEntityFieldsFromDB(
      entityDef,
      differencesFromDBToSchema
    );

    this.schema = this.addAttributesToSchema(entityDefComplete);

    const sqlAdmin = new Sql({
      db: this.db,
      schema: this.schema,
      user: { id: 1 } as any,
    });

    await this.triggers.initTriggers(this.schema, triggers);

    await this.triggers.initTriggers(this.schema, triggers);

    await this.createData({
      data: defaultData,
      sqlAdmin,
      updateData: updateData,
    });

    for (const tableName in entities) {
      if (fieldsAdd[tableName]?.foreignKeys) {
        await this.createForeignKeys({
          table: tableName,
          foreignKeys: fieldsAdd[tableName].foreignKeys,
          actualDBSchema,
        });
      }
    }

    await wait(2000);

    return { schema: this.schema, sqlAdmin, Sql, db: this.db };
  }
}
