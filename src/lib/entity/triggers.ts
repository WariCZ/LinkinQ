import { Knex } from "knex";
import fs from "fs";
import _, { update } from "lodash";
import { DateTime } from "luxon";
import EventEmitter from "events";
import { EntitySchema } from "./types";
import { dbType, Sql } from "./sql";
import { MAIN_GUID, MAIN_ID } from "../knex";
import { hashPassword } from "./utils";

export type CodeType = {
  beforeData: Record<string, any>;
  data: Record<string, any>;
  afterData?: Record<string, any>;
  sql: Sql;
};
export type TriggerItemType = {
  active: boolean;
  guid: string;
  entity: string;
  caption: string;
  type: "before" | "after";
  method: "insert" | "update" | "delete";
  code: ({ beforeData, data, afterData, sql }: CodeType) => void;
};
export type TriggerItemInternalType = TriggerItemType & {
  updatetime: DateTime<true>;
};

export class Triggers {
  db: dbType;
  path: string;
  definitions: Record<
    string,
    Record<string, Record<string, Record<string, TriggerItemInternalType>>>
  > = {};
  eventsOnEntities: EventEmitter;
  schema: EntitySchema = {};
  startWorkflow?: ({ table, data }: { table: string; data: any }) => void;
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
    this.startWorkflow = undefined;
  }

  private getPath(filename: string) {
    return this.path + filename;
  }

  get() {
    return this.definitions;
  }

  prepareDefinition = (trigger: TriggerItemType) => {
    if (!this.definitions[trigger.type]) {
      this.definitions[trigger.type] = {};
    }
    if (!this.definitions[trigger.type][trigger.method]) {
      this.definitions[trigger.type][trigger.method] = {};
    }
    if (!this.definitions[trigger.type][trigger.method][trigger.entity]) {
      this.definitions[trigger.type][trigger.method][trigger.entity] = {};
    }
  };

  //
  setTrigger = async (trigger: TriggerItemType) => {
    try {
      if (trigger.guid) {
        await this.db("triggers")
          .setUser({ id: 1 })
          .where({ guid: trigger.guid })
          .update({
            active: trigger.active,
            caption: trigger.caption,
            code: trigger.code,
            entity: trigger.entity,
            method: trigger.method,
            type: trigger.type,
            guid: trigger.guid,
          });
      } else {
        const t: any = await this.db("triggers")
          .setUser({ id: 1 })
          .insert(trigger)
          .returning(["guid"]);
        trigger.guid = t[0].guid;
      }

      trigger.code = new Function("return " + trigger.code)();
      this.prepareDefinition(trigger);
      this.definitions[trigger.type][trigger.method][trigger.entity][
        trigger.guid
      ] = {
        active: trigger.active,
        caption: trigger.caption,
        code: trigger.code,
        entity: trigger.entity,
        method: trigger.method,
        type: trigger.type,
        guid: trigger.guid,
        updatetime: DateTime.utc(),
      };
    } catch (e) {
      throw e;
    }
  };

  removeTrigger = async (guid: string) => {
    try {
      if (guid) {
        const ret = await this.db("triggers")
          .setUser({ id: 1 })
          .where({ guid: guid })
          .select("*");

        if (ret.length == 1) {
          const trigger: TriggerItemType = ret[0];
          if (
            this.definitions[trigger.type][trigger.method][trigger.entity][guid]
          ) {
            delete this.definitions[trigger.type][trigger.method][
              trigger.entity
            ][guid];

            await this.db("triggers")
              .setUser({ id: 1 })
              .where({ guid: guid })
              .del();
          } else {
            throw `removeTrigger for guid (${guid}) not found definition`;
          }
        } else {
          if (ret.length == 0) {
            throw `removeTrigger for guid (${guid}) is empty`;
          } else {
            throw `removeTrigger for guid (${guid}) found too much rows`;
          }
        }
      } else {
        throw "removeTrigger guid is empty";
      }
    } catch (e) {
      throw e;
    }
  };

  setSchema = (schema: EntitySchema) => {
    this.schema = schema;
  };

  initTriggers = async (schema: EntitySchema) => {
    this.schema = schema;

    const dbTriggers: TriggerItemInternalType[] = await this.db("triggers")
      .setUser({ id: 1 })
      .select("*");

    const registeredGuids = [];
    // Projdu a pridam vse z DB
    for (const trigger of dbTriggers) {
      this.prepareDefinition(trigger);
      //
      trigger.code = new Function("return " + trigger.code)();

      this.definitions[trigger.type][trigger.method][trigger.entity][
        trigger.guid
      ] = trigger;

      registeredGuids.push(trigger.guid);
    }

    // nactu vsechny triggery z FS
    let triggersFS: TriggerItemInternalType[] = [];

    for (const filename of fs.readdirSync(this.path)) {
      const path = require("path");
      if (path.extname(filename) == ".ts") {
        let name = path.basename(filename);

        const stats = await fs.promises.stat(this.getPath(name));
        const x = await import(this.getPath(name));
        const { default: triggers } = await import(this.getPath(name));

        const triggersTmp: TriggerItemInternalType[] = triggers.map(
          (t: TriggerItemInternalType) => ({
            ...t,
            updatetime: DateTime.fromJSDate(stats.mtime),
          })
        );

        triggersFS = triggersFS.concat(triggersTmp);
      }
    }

    for (const trigger of triggersFS) {
      this.prepareDefinition(trigger);
      const dbTrigger: any =
        this.definitions[trigger.type][trigger.method][trigger.entity][
          trigger.guid
        ];

      const codeString = trigger.code.toString();
      if (dbTrigger) {
        //// trigger uz v DB existuje
        if (
          trigger.updatetime.toMillis() >
          DateTime.fromJSDate(dbTrigger.updatetime).toMillis()
        ) {
          await this.db("triggers")
            .setUser({ id: 1 })
            .where({ guid: trigger.guid })
            .update({ ...trigger, code: codeString });
          this.definitions[trigger.type][trigger.method][trigger.entity][
            trigger.guid
          ] = trigger;
        }
      } else {
        // trigger je novy
        this.definitions[trigger.type][trigger.method][trigger.entity][
          trigger.guid
        ] = trigger;
        await this.db("triggers")
          .setUser({ id: 1 })
          .insert({ ...trigger, code: codeString });
        registeredGuids.push(trigger.guid);
      }
    }

    console.log("this.definitions", this.definitions);
  };

  deepDiff(obj1: any, obj2: any) {
    const diff: any = {};

    // Projdeme klíče prvního objektu a zkontrolujeme rozdíly v druhém objektu
    _.forEach(obj2, (value, key) => {
      if (!_.isEqual(value, obj1[key])) {
        diff[key] = value;
      }
    });

    return diff;
  }

  addUniqueKeys(existingKeys: string[], newObject: object): string[] {
    const newKeys = _.keys(newObject);

    const uniqueKeys = _.difference(newKeys, existingKeys);

    return [...existingKeys, ...uniqueKeys];
  }

  translateIdsToNumber = async (table: string, data: any) => {
    const fields = this.schema?.[table].fields;

    for (const d of Array.isArray(data) ? data : [data]) {
      for (const f of Object.keys(d)) {
        if (d[f]) {
          if (
            fields[f].link ||
            fields[f].type == "bigint" ||
            fields[f].type == "integer"
          ) {
            if (fields[f].nlinkTable) {
              d[f] = d[f].map((i: any) => parseInt(i));
            } else {
              d[f] = parseInt(d[f]);
            }
          }
        }
      }
    }
    return data;
  };

  processDataBefore = async ({ table, data }: { table: string; data: any }) => {
    if (data) {
      try {
        const fields = this.schema?.[table].fields;

        for (const d of Array.isArray(data) ? data : [data]) {
          for (const f of Object.keys(d)) {
            if (d[f]) {
              if (fields[f].type == "password") {
                d[f] = await hashPassword(d[f]);
              }
            }
          }
        }
      } catch (e) {
        debugger;
      }
    }
  };

  processDataAfter = async ({
    entity,
    diffDataItem,
    operation,
    entityid,
  }: {
    entity: string;
    diffDataItem: Object;
    operation?: "C" | "D" | "U" | "";
    entityid: number;
  }) => {
    if (diffDataItem) {
      try {
        const fields = this.schema?.[entity].fields;

        for (const f of Object.keys(diffDataItem)) {
          if (fields[f].link && fields[f].link == "attachments") {
            const data = diffDataItem[f];
            await this.db("attachments")
              .setUser({ id: 1 })
              .whereIn("id", data)
              .whereNull("entity")
              .whereNull("entityid")
              .update({ entity: entity, entityid: entityid, field: f });
          }
        }
      } catch (e) {
        debugger;
      }
    }
  };

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
          // if (table == "tasks") debugger;

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

              for (let link of that.schema?.[table]?.nlinkTables || []) {
                const beforeDataNlinks =
                  runner.builder._params?.beforeDataNlinks &&
                  runner.builder._params?.beforeDataNlinks[link.table];

                if (beforeDataNlinks)
                  beforeData = beforeData.map((bd: any) => {
                    const d = _.find(beforeDataNlinks, { id: bd.id });
                    return { ...bd, ...d };
                  });

                beforeData = await that.translateIdsToNumber(table, beforeData);
              }
            }
          }

          const sqlUser = new Sql({
            db: db,
            schema: that.schema,
            user: { id: runner.builder?._user?.id } as any,
          });

          const method =
            runner.builder._method == "del" ? "delete" : runner.builder._method;
          const data = runner.builder._single[runner.builder._method];

          await that.processDataBefore({ table, data });
          if (
            that.definitions["before"] &&
            that.definitions["before"][method] &&
            that.definitions["before"][method][table]
          ) {
            //
            for (const guid in that.definitions["before"][method][table]) {
              const trigger = that.definitions["before"][method][table][guid];
              if (trigger.code && trigger.active) {
                await trigger.code({
                  beforeData,
                  data,
                  sql: sqlUser,
                });
              }
            }
          }

          if (
            runner.builder._method == "insert" ||
            runner.builder._method == "update"
          ) {
            // let returningFields = ["id", "guid"];
            if (runner.builder._single.insert) {
              if (Array.isArray(runner.builder._single.insert)) {
                runner.builder._single.insert =
                  runner.builder._single.insert.map((ins: any) => {
                    ins = {
                      ...ins,
                      createdby: runner.builder?._user.id,
                      createtime: DateTime.now().toFormat(
                        "yyyy-MM-dd HH:mm:ss.SSSZZ"
                      ),
                      updatedby: runner.builder?._user.id,
                      updatetime: DateTime.now().toFormat(
                        "yyyy-MM-dd HH:mm:ss.SSSZZ"
                      ),
                    };
                    // returningFields = that.addUniqueKeys(returningFields, ins);
                    return ins;
                  });
              } else {
                runner.builder._single.insert = {
                  ...runner.builder._single.insert,
                  createdby: runner.builder?._user.id,
                  createtime: DateTime.utc().toFormat(
                    "yyyy-MM-dd HH:mm:ss.SSSZZ"
                  ),
                  updatedby: runner.builder?._user.id,
                  updatetime: DateTime.utc().toFormat(
                    "yyyy-MM-dd HH:mm:ss.SSSZZ"
                  ),
                };

                if (that.schema?.[table]?.workflow && that.startWorkflow) {
                  const workflowData: any = await that.startWorkflow({
                    table,
                    data: runner.builder._single.insert,
                  });
                  runner.builder._single.insert.workflowInstance =
                    workflowData.id;

                  runner.builder._single.insert = {
                    ...runner.builder._single.insert,
                    ...workflowData.data,
                  };
                }
              }
            }

            if (runner.builder._single.update) {
              if (Array.isArray(runner.builder._single.update)) {
                runner.builder._single.update =
                  runner.builder._single.update.map((upd: any) => {
                    upd = {
                      ...upd,
                      updatedby: runner.builder?._user.id,
                      updatetime: DateTime.utc().toFormat(
                        "yyyy-MM-dd HH:mm:ss.SSSZZ"
                      ),
                    };
                    return upd;
                  });
              } else {
                runner.builder._single.update = {
                  ...runner.builder._single.update,
                  updatedby: runner.builder?._user.id,
                  updatetime: DateTime.utc().toFormat(
                    "yyyy-MM-dd HH:mm:ss.SSSZZ"
                  ),
                };
              }
            }
            if (runner.builder._single.returning) {
              runner.builder._single.returning = [
                ...runner.builder._single.returning,
                MAIN_ID,
                MAIN_GUID,
              ];
            } else {
              runner.builder._single.returning = [MAIN_ID, MAIN_GUID];
            }
          }
          return beforeData;
        }
        //
      },
      after: async function (runner, afterData, beforeData) {
        if (["insert", "update", "del"].indexOf(runner.builder._method) > -1) {
          // debugger;
          // console.log("after", afterData, beforeData);
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

          const changedData = runner.builder._params.data;
          if (operation == "U") {
            beforeData = Array.isArray(beforeData) ? beforeData : [beforeData];
            // if (afterData)
            // afterData = Array.isArray(afterData) ? afterData : [afterData];
            afterData = beforeData.map((b: any) => ({ ...b, ...changedData }));
          }
          if (operation == "C") {
            afterData = [
              await that.translateIdsToNumber(table, {
                ...changedData,
                ...runner.builder._single.insert,
                ...afterData[0],
              }),
            ];
          }

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

            const diffDataItem =
              operation === "U"
                ? that.deepDiff(beforeDataItem, afterDataDataItem)
                : undefined;

            if (operation == "U" && Object.keys(diffDataItem).length === 0) {
              console.log("No update");
              continue;
            }
            console.log(
              operation + " - ",
              diffDataItem || beforeDataItem || afterDataDataItem
            );

            await that.processDataAfter({
              entity: table,
              operation,
              diffDataItem,
              entityid: beforeDataItem?.id || afterDataDataItem?.id,
            });

            if (that.schema[table].journal)
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

            const sqlUser = new Sql({
              db: db,
              schema: that.schema,
              user: { id: runner.builder?._user?.id } as any,
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
              for (const guid in that.definitions["after"][method][table]) {
                const trigger = that.definitions["before"][method][table][guid];
                if (trigger.code && trigger.active) {
                  //TODO: mozna by se zde melo cekat nez se kod provede?
                  trigger.code({
                    beforeData: beforeData[i],
                    data: diffDataItem, //runner.builder._single[runner.builder._method],
                    afterData: afterData[i],
                    sql: sqlUser,
                  });
                }
              }
            }

            that.eventsOnEntities.emit("afterTrigger", {
              afterData: afterDataDataItem,
              diffData: diffDataItem,
              beforeData: afterDataDataItem,
              entity: table,
              method: method,
              user: runner.builder?._user,
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
      user,
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
