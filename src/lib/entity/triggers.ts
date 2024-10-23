import { Knex } from "knex";
import fs from "fs";
import _ from "lodash";
import { DateTime } from "luxon";
import EventEmitter from "events";

type TriggerItem = {
  entity: string;
  caption: string;
  type: "before" | "after";
  code: Function;
  modifytime: DateTime<true>;
};
export class Triggers {
  db: Knex.QueryBuilder<any, unknown[]>;
  path: string;
  definitions: Record<string, TriggerItem[]> = {};
  eventsOnEntities: EventEmitter;
  constructor({
    db,
    eventsOnEntities,
  }: {
    db: Knex<any, unknown[]>;
    eventsOnEntities: EventEmitter;
  }) {
    this.path = process.cwd() + "/triggers/";
    this.eventsOnEntities = eventsOnEntities;
    this.db = db.setUser({ id: 1 });

    this.registerTriggers(db);
  }

  private getPath(filename: string) {
    return this.path + filename;
  }

  get() {
    return this.definitions;
  }

  initTriggers = async () => {
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
      if (!this.definitions[trigger.entity]) {
        this.definitions[trigger.entity] = [];
      }
      this.definitions[trigger.entity].push(trigger);

      const dbTrigger: any = { ...trigger };
      dbTrigger.code = dbTrigger.code.toString();
      delete dbTrigger.modifytime;

      const getterTrigger = this.db
        .select("updatetime")
        .from("triggers")
        .where({ caption: trigger.caption });

      const existsTrigger = await getterTrigger;

      if (existsTrigger.length == 0) {
        await this.db.from("triggers").insert(dbTrigger);
      } else {
        if (
          trigger.modifytime.toMillis() >
          DateTime.fromJSDate(existsTrigger[0].updatetime).toMillis()
        ) {
          await this.db
            .from("triggers")
            .where({ caption: trigger.caption })
            .update(dbTrigger);
        }
      }
    }
  };

  registerTriggers(db: Knex) {
    const that = this;
    db.registerTriggers({
      before: async function (runner) {
        if (!runner.builder?._user?.id) {
          debugger;
          return false;
        }

        if (["insert", "update", "del"].indexOf(runner.builder._method) > -1) {
          const table = runner.builder._single.table;
          if (that.definitions[table]) {
            that.definitions[table][0].code();
            // debugger;
          }
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

              beforeData = await db(table)
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
                      ...(runner.builder._method == "update"
                        ? {
                            updatetime: DateTime.now().toFormat(
                              "yyyy-MM-dd HH:mm:ss.SSSSSSZZ"
                            ),
                          }
                        : {}),
                    };
                  });
              } else {
                runner.builder._single.insert = {
                  ...runner.builder._single.insert,
                  createdby: runner.builder?._user.id,
                  updatedby: runner.builder?._user.id,
                  ...(runner.builder._method == "update"
                    ? {
                        updatetime: DateTime.now().toFormat(
                          "yyyy-MM-dd HH:mm:ss.SSSSSSZZ"
                        ),
                      }
                    : {}),
                };
              }
            }

            if (runner.builder._single.update) {
              if (Array.isArray(runner.builder._single.update)) {
                runner.builder._single.update =
                  runner.builder._single.update.map((upd: any) => {
                    return {
                      ...upd,
                      updatedby: runner.builder?._user.id,
                      updatetime: DateTime.now().toFormat(
                        "yyyy-MM-dd HH:mm:ss.SSSSSSZZ"
                      ),
                    };
                  });
              } else {
                runner.builder._single.update = {
                  ...runner.builder._single.update,
                  updatedby: runner.builder?._user.id,
                  updatetime: DateTime.now().toFormat(
                    "yyyy-MM-dd HH:mm:ss.SSSZZ"
                  ),
                };
              }
              runner.builder._single.returning = "*";
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

          if (runner.builder._single.insert) {
            afterData[0] = {
              ...afterData[0],
              ...runner.builder._single.insert,
            };
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
    await this.db.from("journal").insert({
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
}
