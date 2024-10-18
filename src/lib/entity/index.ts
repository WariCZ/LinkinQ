import { Knex } from "knex";
import _, { update } from "lodash";
import { DbSchemaType, EntitySchema, EntityType, FieldType } from "./types";
import { db as knexDB } from "../knex";
import {
  addDefaultFields,
  findDifferences,
  translateDefaultDBtoSchema,
  translateDataTypesDBtoSchema,
  wait,
} from "./utils";
import { defaultData, defaultEntities, defaultFields } from "./defaultEntities";
import logger from "../logger";
import EventEmitter from "events";

export class Entity {
  db: Knex;
  MAIN_ID: string = "id";
  GUID_ID: string = "guid";
  schema: EntitySchema = {};
  eventsOnEntities: EventEmitter;

  constructor() {
    this.db = knexDB;
    this.eventsOnEntities = new EventEmitter();
  }

  defaultExecute() {
    return ['CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'];
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

        // if (column_name == "lockedby") debugger;
        // let referencedtableName;
        if (foreignKeyInfo) {
          dbSchema.foreignKeys.push(foreignKeyInfo.constraint_name);

          // const referencedTable = await this.db
          //   .select("unique_constraint_name")
          //   .from("information_schema.referential_constraints")
          //   .where("constraint_name", foreignKeyInfo.constraint_name)
          //   .andWhere("constraint_schema", "public");

          // if (referencedTable.length > 0) {
          //   if (referencedTable.length > 1) {
          //     debugger;
          //   }
          //   dbSchema.foreignKeys.push(
          //     referencedTable[0].unique_constraint_name
          //   );
          // }
          // referencedtableName =
          //   referencedTable.length > 0
          //     ? referencedTable[0].unique_constraint_name
          //     : null;
        }

        // get description
        // console.log([table_name, column_name, table_name]);

        const desc_result = await this.db
          .raw(
            `SELECT col_description(?::regclass::oid,
      (SELECT attnum FROM pg_attribute
       WHERE attname = ? AND attrelid = ?::regclass))`,
            [table_name, column_name, table_name]
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

  async createField({
    tableName,
    columnName,
    columnDef,
    actualDBSchema,
  }: {
    tableName: string;
    columnName: string;
    columnDef: FieldType;
    actualDBSchema: DbSchemaType;
  }) {
    if (columnName == this.MAIN_ID) {
      return;
    }

    let columnExists = false;
    let actualDBColumn: FieldType | undefined;

    // if (columnName == "id") debugger;
    if (
      await this.db.schema.setUser({ id: 1 }).hasColumn(tableName, columnName)
    ) {
      columnExists = true;
      actualDBColumn = actualDBSchema.tables[tableName]?.fields[columnName];
    }

    await this.db.schema
      .setUser({ id: 1 })
      .alterTable(tableName, async (table) => {
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
            columnDef = { ...actualDBColumn, ...columnDef };
          }
        }
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
        } else if (columnDef.type == "json") {
          column = table.json(columnName);
        } else if (columnDef.type == "jsonb") {
          column = table.jsonb(columnName);
        } else if (columnDef.type == "boolean") {
          column = table.boolean(columnName);
        } else if (columnDef.type == "password") {
          column = table.string(columnName);
        } else if (columnDef.type?.match(/^link\(\w+\)$/)) {
          column = table.bigint(columnName);
          const rel = columnDef.type.match(/^link\((\w+)\)$/);

          if (rel) {
            const foreignKey = rel[1] + "_" + columnName + "_foreign";
            if (actualDBSchema.foreignKeys.indexOf(foreignKey) == -1) {
              table.foreign(columnName).references(rel[1] + "." + this.MAIN_ID);
            }
          } else {
            logger.info(
              `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ link ${columnDef.type}.`
            );
          }
        } else if (columnDef.type?.match(/^nlink\(\w+\)$/)) {
          // return;
          const rel = columnDef.type.match(/^nlink\((\w+)\)$/);
          if (rel) {
            if (
              !(await this.db.schema
                .setUser({ id: 1 })
                .hasTable(tableName + "2" + rel[1] + "4" + columnName))
            ) {
              // debugger;
              await this.db.schema.createTable(
                tableName + "2" + rel[1] + "4" + columnName,
                (table: any) => {
                  table.bigint(this.MAIN_ID).primary();
                  table.bigint("source");
                  table.bigint("target");

                  table
                    .foreign("source")
                    .references(tableName + "." + this.MAIN_ID);
                  //TODO: musi se provest az uplne na konci Conclusion nema taky :-)

                  table
                    .foreign("target")
                    .references(rel[1] + "." + this.MAIN_ID);
                }
              );
            } else {
              logger.info(
                `Tabulka ${
                  tableName + "2" + rel[1] + "4" + columnName
                } již existuje.`
              );
            }
          } else {
            logger.error(
              `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ nlink ${columnDef.type}.`
            );
          }
        } else {
          logger.error(
            `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ ${columnDef.type}.`
          );
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
            column.defaultTo(this.db.fn.now());
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
    // }
  }

  async createTable({
    tableName,
    schemaDefinition,
  }: {
    tableName: string;
    schemaDefinition: EntitySchema;
  }) {
    //
    // Zjistim zda tabulka existuje
    if (!(await this.db.schema.setUser({ id: 1 }).hasTable(tableName))) {
      await this.db.schema
        .setUser({ id: 1 })
        .createTable(tableName, async (table) => {
          // nastavim defaultni sloupce
          const column = table.bigIncrements(this.MAIN_ID);
          table.primary([this.MAIN_ID]);
          if (schemaDefinition[tableName].fields[this.MAIN_ID].description) {
            column.comment(
              schemaDefinition[tableName].fields[this.MAIN_ID].description ||
                "ID record"
            );
          }
        });
      logger.info(`Tabulka ${tableName} vytvořena.`);
    } else {
      // logger.info(`Tabulka ${tableName} již existuje.`);
    }
  }

  async createTables({
    schemaDefinition,
    actualDBSchema,
  }: {
    schemaDefinition: EntitySchema;
    actualDBSchema: DbSchemaType;
  }) {
    for (const tableName in schemaDefinition) {
      await this.createTable({
        tableName,
        schemaDefinition,
      });
    }

    for (const tableName in schemaDefinition) {
      const fields = {
        ...schemaDefinition[tableName].fields,
      };
      // Zacnu pridavat sloupce
      logger.info(`Kontrola sloupcu pro tabulku ${tableName}`);
      for (const columnName in fields) {
        await this.createField({
          tableName,
          columnName: columnName,
          columnDef: fields[columnName],
          actualDBSchema: actualDBSchema,
        });
      }
    }
  }

  async createData({
    data,
    entityDef,
  }: {
    data: Object;
    entityDef: EntitySchema;
  }) {
    for (const [name, dataArray] of Object.entries(data)) {
      const linksFields = Object.keys(entityDef[name].fields).filter((key) =>
        entityDef[name].fields[key]?.type?.startsWith("link")
      );

      for (const d of dataArray) {
        var rows = await this.db(name)
          .setUser({ id: 1 })
          .select()
          .where("guid", d.guid);
        if (rows.length === 0) {
          for (const key of linksFields) {
            if (typeof d[key] === "string") {
              const columnDef = entityDef[name].fields[key];

              const rel = columnDef.type?.match(/^link\((\w+)\)$/);
              if (rel && rel[1]) {
                var rows = await this.db(rel[1])
                  .setUser({ id: 1 })
                  .select(this.MAIN_ID)
                  .where("guid", d[key]);
                if (rows.length === 1) {
                  d[key] = rows[0][this.MAIN_ID];
                } else {
                  if (rows.length === 0) {
                    logger.error(
                      `Dohledavany zaznam nenalezen tabulka ${name} sloupec ${key} - ${JSON.stringify(
                        d
                      )}`
                    );
                    return;
                  } else {
                    logger.error(
                      `Dohledano moc zaznamu tabulka ${name} sloupec ${key} - ${JSON.stringify(
                        d
                      )}`
                    );
                    return;
                  }
                }
              }
            }
          }

          await this.db(name).setUser({ id: 1 }).insert([d]);
        }
      }
    }
  }

  // async initSchema() {
  //   this.schema = await this.prepareSchema();
  // }

  getSchema() {
    return this.schema;
  }
  setSchema(schema: EntitySchema) {
    return (this.schema = schema);
  }

  async prepareSchema() {
    await this.defaultExecute().map(async (e) => {
      await this.db.raw(e).setUser({ id: 1 });
    });
    this.registerTriggers();

    const schemaDefinition = defaultEntities();

    const entityDef = addDefaultFields(schemaDefinition);

    const actualDBSchema = await this.getTablesAndColumns(entityDef);
    const differencesAdd = findDifferences(actualDBSchema, entityDef);
    console.log("differencesAdd", differencesAdd);

    console.log("Create tables");
    await this.createTables({
      schemaDefinition: differencesAdd,
      actualDBSchema: actualDBSchema,
    });
    await this.createData({ data: defaultData(), entityDef });

    await wait(2000);

    this.schema = entityDef;
    return entityDef;
  }

  async addToJournal({
    entity,
    fields_old,
    fields_new,
    operation,
    user,
    entityid,
    entityguid,
  }: {
    entity: string;
    fields_old: Object;
    fields_new: Object;
    operation?: "C" | "D" | "U" | "";
    user: number;
    entityid: number;
    entityguid: string;
  }) {
    await this.db("journal").setUser({ id: 1 }).insert({
      caption: entity,
      entity,
      fields_old,
      fields_new,
      operation,
      entityid,
      entityguid,
      createdby: user,
      updatedby: user,
    });
  }

  registerTriggers() {
    const that = this;
    this.db.registerTriggers({
      before: async function (runner) {
        if (!runner.builder?._user?.id) {
          debugger;
          return false;
        }

        if (["insert", "update", "del"].indexOf(runner.builder._method) > -1) {
          const table = runner.builder._single.table;
          if (table == "journal") return;

          let beforeData;

          if (
            runner.builder._method == "update" ||
            runner.builder._method == "del"
          ) {
            const sqlObj = runner.builder.toSQL() as any;
            const w = sqlObj.sql.match(/where(.*?)(returning|$)/i);
            if (w && w[1]) {
              const whereRaw = w[1].replace("where ", "");
              const bindsLength = _.countBy(sqlObj.sql)["?"] || 0;
              const whereBindsLength = _.countBy(whereRaw)["?"] || 0;
              const selectBinds = sqlObj.bindings.slice(
                bindsLength - whereBindsLength
              );

              beforeData = await that
                .db(table)
                .setUser({ id: 1 })
                .select("*")
                .whereRaw(whereRaw, selectBinds);
            }
          }

          if (
            runner.builder._method == "insert" ||
            runner.builder._method == "update"
          ) {
            if (runner.builder._single.insert) {
              runner.builder._single.returning = ["id", "guid"];

              if (Array.isArray(runner.builder._single.insert)) {
                runner.builder._single.insert =
                  runner.builder._single.insert.map((ins: any) => {
                    return {
                      ...ins,
                      createdby: runner.builder?._user.id,
                      updatedby: runner.builder?._user.id,
                    };
                  });
              } else {
                runner.builder._single.insert = {
                  ...runner.builder._single.insert,
                  createdby: runner.builder?._user.id,
                  updatedby: runner.builder?._user.id,
                };
              }
            }
          }
          return beforeData;
        }
        //
      },
      after: async function (runner, afterData, beforeData) {
        if (["insert", "update", "del"].indexOf(runner.builder._method) > -1) {
          // debugger;
          console.log("after", afterData, beforeData);
          const table = runner.builder._single.table;
          if (table == "journal") return;

          let operation: "C" | "U" | "D" | "";
          // let afterData;
          if (runner.builder._method == "insert") {
            operation = "C";
          } else if (runner.builder._method == "update") operation = "U";
          else if (runner.builder._method == "del") operation = "D";
          else operation = "";

          let fields_new = afterData[0];
          if (runner.builder._single.insert) {
            fields_new = { ...afterData[0], ...runner.builder._single.insert };
          }

          beforeData = Array.isArray(beforeData) ? beforeData : [beforeData];
          afterData = Array.isArray(afterData) ? afterData : [afterData];

          const data = [];

          for (let i = 0; i < beforeData.length; i++) {
            data.push({ beforeData: beforeData[i], afterData: afterData[i] });

            await that.addToJournal({
              entity: table,
              fields_new: operation !== "D" ? afterData[i] : null,
              fields_old: beforeData[i],
              entityid: beforeData[i]?.id || afterData[i]?.id,
              entityguid: beforeData[i]?.guid || afterData[i]?.guid,
              operation: operation,
              user: runner.builder?._user?.id,
            });

            that.eventsOnEntities.emit("afterTrigger", {
              afterData: afterData[i],
              beforeData: beforeData[i],
              entity: table,
            });
          }
        }
      },
    });
  }
}
