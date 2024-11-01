import { Knex } from "knex";
import fs from "fs";
import _ from "lodash";
import { DateTime } from "luxon";
import EventEmitter from "events";
import { EntitySchema } from "./types";
import { dbType } from "./sql";

export type TriggerItem = {
  entity: string;
  caption: string;
  type: "before" | "after";
  method: "insert" | "update" | "delete";
  code: ({
    beforeData,
    data,
    afterData,
  }: {
    beforeData: Object;
    data: Object;
    afterData?: Object;
  }) => void;
  modifytime: DateTime<true>;
};

export class Triggers {
  db: dbType;
  path: string;
  definitions: Record<string, Record<string, Record<string, TriggerItem[]>>> =
    {};
  eventsOnEntities: EventEmitter;
  schema: EntitySchema = {};
  constructor({
    db,
    eventsOnEntities,
  }: {
    db: Knex<any, unknown[]>;
    eventsOnEntities: EventEmitter;
  }) {
    this.path = process.cwd() + "/triggers/";
    this.eventsOnEntities = eventsOnEntities;
    this.db = (table: string) => db(table).setUser({ id: 1 });

    this.registerTriggers(db);
  }

  private getPath(filename: string) {
    return this.path + filename;
  }

  get() {
    return this.definitions;
  }

  initTriggers = async (schema: EntitySchema) => {
    this.schema = schema;
    let triggersArray: TriggerItem[] = [];
    for (const filename of fs.readdirSync(this.path)) {
      const path = require("path");
      if (path.extname(filename) == ".ts") {
        let name = path.basename(filename);

        const stats = await fs.promises.stat(this.getPath(name));
        const { default: triggers } = await import(this.getPath(name));

        const triggersTmp = triggers.map((t: TriggerItem) => ({
          ...t,
          modifytime: DateTime.fromJSDate(stats.mtime),
        }));
        triggersArray = triggersArray.concat(triggersTmp);
      }
    }

    for (const trigger of triggersArray) {
      if (!this.definitions[trigger.type]) {
        this.definitions[trigger.type] = {};
      }
      if (!this.definitions[trigger.type][trigger.method]) {
        this.definitions[trigger.type][trigger.method] = {};
      }
      if (!this.definitions[trigger.type][trigger.method][trigger.entity]) {
        this.definitions[trigger.type][trigger.method][trigger.entity] = [];
      }
      this.definitions[trigger.type][trigger.method][trigger.entity].push(
        trigger
      );
      //
      const dbTrigger: any = { ...trigger };
      dbTrigger.code = dbTrigger.code.toString();
      delete dbTrigger.modifytime;

      const getterTrigger = this.db("triggers")
        .select("updatetime")
        .where({ caption: trigger.caption });

      const existsTrigger = await getterTrigger;

      if (existsTrigger.length == 0) {
        await this.db("triggers").insert(dbTrigger);
      } else {
        if (
          trigger.modifytime.toMillis() >
          DateTime.fromJSDate(existsTrigger[0].updatetime).toMillis()
        ) {
          await this.db("triggers")
            .where({ caption: trigger.caption })
            .update(dbTrigger);
        }
      }
    }
  };

  deepDiff(obj1: Object, obj2: Object) {
    return _.transform(obj1, (result: any, value, key) => {
      if (!_.isEqual(value, obj2[key])) {
        if (_.isObject(value) && _.isObject(obj2[key])) {
          const diff = this.deepDiff(value, obj2[key]);
          if (!_.isEmpty(diff)) {
            result[key] = diff;
          }
        } else {
          result[key] = obj2[key];
        }
      }
    });
  }

  addUniqueKeys(existingKeys: string[], newObject: object): string[] {
    const newKeys = _.keys(newObject);

    const uniqueKeys = _.difference(newKeys, existingKeys);

    return [...existingKeys, ...uniqueKeys];
  }

  registerTriggers(db: Knex) {
    const that = this;
    db.registerTriggers({
      before: async function (runner) {
        let beforeData: any;
        if (!runner.builder?._user?.id) {
          debugger;
          return false;
        }

        if (["insert", "update", "del"].indexOf(runner.builder._method) > -1) {
          const table = runner.builder._single.table;

          if (!that.schema[table]) {
            return;
          }
          if (table == "journal") return;

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

              beforeData = await db(table)
                .setUser({ id: 1 })
                .select("*")
                .whereRaw(whereRaw, selectBinds);
            }
          }

          const method =
            runner.builder._method == "del" ? "delete" : runner.builder._method;
          if (
            that.definitions["before"] &&
            that.definitions["before"][method] &&
            that.definitions["before"][method][table]
          ) {
            const data = runner.builder._single[runner.builder._method];
            that.definitions["before"][method][table].map((trigger) => {
              if (trigger.code) {
                trigger.code({
                  beforeData,
                  data,
                });
              }
            });
            // debugger;
          }

          if (
            runner.builder._method == "insert" ||
            runner.builder._method == "update"
          ) {
            let returningFields = ["id", "guid"];
            if (runner.builder._single.insert) {
              if (Array.isArray(runner.builder._single.insert)) {
                runner.builder._single.insert =
                  runner.builder._single.insert.map((ins: any) => {
                    ins = {
                      ...ins,
                      createdby: runner.builder?._user.id,
                      createtime: DateTime.now().toFormat(
                        "yyyy-MM-dd HH:mm:ss.SSSSSSZZ"
                      ),
                      updatedby: runner.builder?._user.id,
                      updatetime: DateTime.now().toFormat(
                        "yyyy-MM-dd HH:mm:ss.SSSSSSZZ"
                      ),
                    };
                    returningFields = that.addUniqueKeys(returningFields, ins);
                    return ins;
                  });
              } else {
                runner.builder._single.insert = {
                  ...runner.builder._single.insert,
                  createdby: runner.builder?._user.id,
                  createtime: DateTime.now().toFormat(
                    "yyyy-MM-dd HH:mm:ss.SSSSSSZZ"
                  ),
                  updatedby: runner.builder?._user.id,
                  updatetime: DateTime.now().toFormat(
                    "yyyy-MM-dd HH:mm:ss.SSSSSSZZ"
                  ),
                };
                returningFields = [
                  ...returningFields,
                  ..._.keys(runner.builder._single.insert),
                ];
              }
            }

            if (runner.builder._single.update) {
              if (Array.isArray(runner.builder._single.update)) {
                runner.builder._single.update =
                  runner.builder._single.update.map((upd: any) => {
                    upd = {
                      ...upd,
                      updatedby: runner.builder?._user.id,
                      updatetime: DateTime.now().toFormat(
                        "yyyy-MM-dd HH:mm:ss.SSSSSSZZ"
                      ),
                    };
                    returningFields = that.addUniqueKeys(returningFields, upd);
                    return upd;
                  });
              } else {
                runner.builder._single.update = {
                  ...runner.builder._single.update,
                  updatedby: runner.builder?._user.id,
                  updatetime: DateTime.now().toFormat(
                    "yyyy-MM-dd HH:mm:ss.SSSZZ"
                  ),
                };
                returningFields = [
                  ...returningFields,
                  ..._.keys(runner.builder._single.update),
                ];
              }
            }
            runner.builder._single.returning = returningFields;
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
          if (!that.schema[table]) {
            return;
          }
          if (table == "journal") return;

          let operation: "C" | "U" | "D" | "";
          // let afterData;
          if (runner.builder._method == "insert") {
            operation = "C";
          } else if (runner.builder._method == "update") operation = "U";
          else if (runner.builder._method == "del") operation = "D";
          else operation = "";

          if (
            operation == "D" &&
            Array.isArray(beforeData) &&
            beforeData.length == 0
          ) {
            return;
          }

          if (beforeData)
            beforeData = Array.isArray(beforeData) ? beforeData : [beforeData];
          if (afterData)
            afterData = Array.isArray(afterData) ? afterData : [afterData];

          //   const data = [];

          let dataLength = beforeData?.length || afterData?.length || 0;
          if (beforeData?.length !== afterData?.length && operation === "U") {
            debugger;
            console.error(
              "beforeData and afterData not same",
              beforeData,
              afterData
            );
            return;
          }
          for (let i = 0; i < dataLength; i++) {
            const beforeDataItem = beforeData && beforeData[i];
            const afterDataDataItem = afterData && afterData[i];
            const diffDataItem = that.deepDiff(
              beforeDataItem,
              afterDataDataItem
            );

            await that.addToJournal({
              entity: table,
              fields_new: operation !== "D" ? afterDataDataItem : null,
              fields_diff: diffDataItem,
              fields_old: beforeDataItem,
              entityid: beforeDataItem?.id || afterDataDataItem?.id,
              entityguid: beforeDataItem?.guid || afterDataDataItem?.guid,
              operation: operation,
              user: runner.builder?._user?.id,
            });

            const method =
              runner.builder._method == "del"
                ? "delete"
                : runner.builder._method;
            if (
              that.definitions["after"] &&
              that.definitions["after"][method] &&
              that.definitions["after"][method][table]
            ) {
              that.definitions["after"][method][table].map((trigger) => {
                if (trigger.code) {
                  trigger.code({
                    beforeData: beforeData[i],
                    data: diffDataItem, //runner.builder._single[runner.builder._method],
                    afterData: afterData[i],
                  });
                }
              });
            }

            that.eventsOnEntities.emit("afterTrigger", {
              afterData: afterDataDataItem,
              diffData: diffDataItem,
              beforeData: afterDataDataItem,
              entity: table,
            });
          }
        }
      },
    });
  }

  async addToJournal({
    entity,
    fields_old,
    fields_diff,
    fields_new,
    operation,
    user,
    entityid,
    entityguid,
  }: {
    entity: string;
    fields_old: Object;
    fields_diff: Object;
    fields_new: Object;
    operation?: "C" | "D" | "U" | "";
    user: number;
    entityid: number;
    entityguid: string;
  }) {
    await this.db("journal").insert({
      caption: entity,
      entity,
      fields_old,
      fields_diff,
      fields_new,
      operation,
      entityid,
      entityguid,
      createdby: user,
      updatedby: user,
    });
  }
}
