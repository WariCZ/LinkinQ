import { Knex } from "knex";
import _ from "lodash";
import { EntitySchema, EntityType, FieldType } from "./types";
import { db as knexDB } from "../knex";
import {
  addDefaultFields,
  findDifferences,
  translateDefaultDBtoSchema,
  translateDataTypesDBtoSchema,
} from "./utils";
import { defaultData, defaultEntities, defaultFields } from "./defaultEntities";
import logger from "../logger";

export class Entity {
  schema: EntitySchema;
  db: Knex;
  MAIN_ID: string = "id";

  constructor() {
    this.schema = {};
    this.db = knexDB;
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
        .from("information_schema.columns")
        .where("table_schema", "public");

      const tables: EntitySchema = {};

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

        const foreignKeys = await this.db
          .select("constraint_name")
          .from("information_schema.key_column_usage")
          .where("table_schema", "public")
          .where("table_name", table_name)
          .where("column_name", column_name);

        const foreignKeyInfo = foreignKeys.length > 0 ? foreignKeys[0] : null;

        let referencedtableName;
        if (foreignKeyInfo) {
          const referencedTable = await this.db
            .select("unique_constraint_name")
            .from("information_schema.referential_constraints")
            .where("constraint_name", foreignKeyInfo.constraint_name)
            .andWhere("constraint_schema", "public");

          referencedtableName =
            referencedTable.length > 0
              ? referencedTable[0].unique_constraint_name
              : null;
        }

        // get description
        const desc_result = await this.db.raw(
          `SELECT col_description(?::regclass::oid,
      (SELECT attnum FROM pg_attribute
       WHERE attname = ? AND attrelid = ?::regclass))`,
          [table_name, column_name, table_name]
        );

        // if (column_name == "id") debugger;

        tables[table_name].fields[column_name] = {
          label:
            entityDef[table_name]?.fields[column_name]?.label || column_name,
          type: translateDataTypesDBtoSchema(
            data_type,
            table_name,
            column_name
          ),
          ...(desc_result.rows[0].col_description
            ? { description: desc_result.rows[0].col_description }
            : {}),
          ...(is_nullable ? { isRequired: is_nullable === "NO" } : {}),
          ...(column_default
            ? { default: translateDefaultDBtoSchema(column_default) }
            : {}),
          ...(referencedtableName ? { isRelation: referencedtableName } : {}),
          ...(character_maximum_length ? character_maximum_length : {}),
          ...(entityDef[table_name]?.fields[column_name]?.system
            ? { system: true }
            : {}),
          // "isList": false,
          // "isRelation": false
          // is_nullable,
          // column_default,
        };
      }

      return tables;
    } catch (error) {
      console.error("Chyba při získávání tabulek a sloupců", error);
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
    actualDBSchema: EntitySchema;
  }) {
    if (columnName == this.MAIN_ID) {
      return;
    }
    //   console.log("columnName: ", columnName);
    // if (await this.db.schema.hasColumn(tableName, columnName)) {
    //   debugger;

    //   await this.db.schema.alterTable(tableName, async (table) => {

    //   debugger;
    //     table.string(columnName).notNullable().alter();
    //   })
    //   logger.info(
    //     "info",
    //     `  Sloupec ${columnName} již existuje v tabulce ${tableName}.`
    //   );
    // } else {

    let columnExists = false;
    let actualDBColumn: FieldType | undefined;

    // if (columnName == "id") debugger;
    if (await this.db.schema.hasColumn(tableName, columnName)) {
      columnExists = true;
      actualDBColumn = actualDBSchema[tableName]?.fields[columnName];
    }

    await this.db.schema.alterTable(tableName, async (table) => {
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

      if (columnDef.type == "text") {
        column = table.text(columnName);
      } else if (columnDef.type == "integer") {
        column = table.integer(columnName);
      } else if (columnDef.type == "uuid") {
        column = table
          .uuid(columnName)
          .defaultTo(this.db.raw("uuid_generate_v4()"));
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
      } else if (columnDef.type?.match(/^link\(\w+\)$/)) {
        column = table.bigInteger(columnName);
        const rel = columnDef.type.match(/^link\((\w+)\)$/);
        if (rel) {
          table.foreign(columnName).references(rel[1] + "." + this.MAIN_ID);
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
            !(await this.db.schema.hasTable(
              tableName + "2" + rel[1] + "4" + columnName
            ))
          ) {
            await this.db.schema.createTable(
              tableName + "2" + rel[1] + "4" + columnName,
              (table: any) => {
                table.bigIncrements(this.MAIN_ID).primary();
                table.bigint("source");
                table.bigint("target");

                table
                  .foreign("source")
                  .references(tableName + "." + this.MAIN_ID);
                //TODO: musi se provest az uplne na konci Conclusion nema taky :-)
                // table
                //   .foreign("target")
                //   .references(columnDef.isRelation + ".id");
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
          logger.info(
            `  Sloupec ${columnName} v tabulce ${tableName} má neznámy typ nlink ${columnDef.type}.`
          );
        }
      } else {
        logger.info(
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
            `  Sloupec ${columnName} byl vytvořen v tabulce ${tableName}.`
          );
        }
      } else {
        logger.error(
          `  Sloupec ${columnName} pro tabulku ${tableName} nebyl vytvoren a ma prazdny column.`
        );
      }
    });
    // }
  }

  async createTable({ tableName }: { tableName: string }) {
    // Zjistim zda tabulka existuje
    if (!(await this.db.schema.hasTable(tableName))) {
      await this.db.schema.createTable(tableName, async (table) => {
        // nastavim defaultni sloupce
        table.increments(this.MAIN_ID);
        table.primary([this.MAIN_ID]);
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
    actualDBSchema: EntitySchema;
  }) {
    for (const tableName in schemaDefinition) {
      await this.createTable({
        tableName,
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

  async createData({ data }: { data: Object }) {
    _.mapKeys(data, async (dataArray: any, name) => {
      dataArray.map(async (d: any) => {
        var rows = await this.db(name).select().where("guid", d.guid);
        if (rows.length === 0) {
          await this.db(name).insert([d]);
        }
      });
    });

    // await db("users").insert([
    //   { caption: "user1", fullname: "user1", createdby: 1, updatedby: 1 },
    //   { caption: "user2", fullname: "user2", createdby: 1, updatedby: 1 },
    // ]);
    // await db("users")
    //   .update({ caption: "user1 Update" })
    //   .where({ caption: "user1" });

    // await db("users")
    //   .where({ caption: "user1 Update" })
    //   .orWhere({ caption: "user2" })
    //   .delete();
  }

  //
  async setSchema() {
    await this.defaultExecute().map(async (e) => {
      await this.db.raw(e);
    });

    // debugger;
    // await this.db.schema.alterTable("users", async (table) => {
    //   table
    //     .bigIncrements("id")
    //     // .primary()
    //     // .notNullable()
    //     .comment("Toto je můj komentářd")
    //     .alter();
    // });
    // debugger;
    // return;
    // debugger;
    //
    // let column: Knex.ColumnBuilder | undefined = undefined;
    // await this.db.schema.alterTable("users", async (table) => {
    //   // await this.db.schema.alterTable(tableName, async (table) => {
    //   // Vytvoříme sloupec
    //   column = table.text("fullname");

    //   // Přidáme komentář, pokud máme definici komentáře
    //   column.comment("DDDWQCVEDVV dwae ");

    //   // Zavoláme alter, abychom sloupec upravili
    //   // column.alter();
    // });
    // debugger;
    // return;
    // const row = await this.db.raw(
    //   `SELECT col_description(?::regclass::oid,
    //   (SELECT attnum FROM pg_attribute
    //    WHERE attname = ? AND attrelid = ?::regclass))`,
    //   ["roles", "guidd", "roles"]
    // );

    // debugger;

    const schemaDefinition = defaultEntities();

    const entityDef = addDefaultFields(schemaDefinition);

    const actualDBSchema: any = await this.getTablesAndColumns(entityDef);

    const differencesAdd = findDifferences(actualDBSchema, entityDef);

    await this.createTables({
      schemaDefinition: differencesAdd,
      actualDBSchema: actualDBSchema,
    });

    await this.createData({ data: defaultData() });

    return actualDBSchema;
  }
}
