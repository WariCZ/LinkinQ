import { Knex } from "knex";
import { addWhere, getData, getQueries } from "./methodsDB";
import { EntitySchema } from "./types";
import { User } from "../auth";
import _ from "lodash";
import { MAIN_ID } from "../knex";

export type dbType = (table: string) => Knex.QueryBuilder<any, unknown[]>;
export class Sql {
  #schema: EntitySchema = {};
  #knex: Knex;
  #db: dbType; //Knex.QueryBuilder<any, unknown[]>;
  user: User | any;

  constructor({
    schema,
    db,
    user,
  }: {
    schema: EntitySchema;
    db: Knex<any, unknown[]>;
    user: User;
  }) {
    this.#schema = schema;
    this.#knex = db;
    this.#db = (table: string) => db(table).setUser(user);
    this.user = user;
  }

  select = async ({
    entity,
    fields,
    where,
    orderBy,
    groupBy,
    limit,
  }: {
    entity: string;
    fields?: string[];
    where?: any;
    orderBy?: string[];
    groupBy?: string[];
    limit?: number;
  }) => {
    if (entity) {
      if (this.#schema[entity]) {
        const queries = getQueries({
          schema: this.#schema,
          entity,
          fieldsArr: fields || ["*"],
          where: where,
          user: this.user,
        });

        const ret = await getData({
          db: this.#db,
          ...queries,
          schema: this.#schema,
          orderBy: orderBy,
          // groupBy: groupBy
        });

        return ret;
      } else {
        throw `Entity ${entity} not exists`;
      }
    } else {
      throw `Entity not found`;
    }
  };

  getLinks = async (entity: string, dataItem: any[]) => {
    let joinsIds: any = {};
    const newDataItem = { ...dataItem };
    const data = { ...dataItem };
    console.log("getLinks", dataItem);
    for (let d of Object.keys(newDataItem) as any) {
      if (this.#schema[entity].fields[d].type.indexOf("link(") > -1) {
        if (this.user.id == 1 && Number.isInteger(newDataItem[d])) {
          // admin muze zadavat pres konkretni id ostatni musi pres GUID
          data[d] = newDataItem[d];
        } else {
          const match =
            this.#schema[entity].fields[d].type.match(/.*link\((\w+)\)/);
          if (match && match[0].indexOf("nlink") > -1 && match[1]) {
            const joinTable = entity + "2" + match[1] + "4" + d;

            const w = Array.isArray(newDataItem[d])
              ? newDataItem[d]
              : [newDataItem[d]];

            const targetIds = await this.#db(match[1])
              .select("id")
              .whereIn("guid", w);
            joinsIds[joinTable] = targetIds;
            data[d] = targetIds.map((t) => parseInt(t[MAIN_ID]));
            delete newDataItem[d];
          } else if (match && match[0].indexOf("link") > -1 && match[1]) {
            console.log("getLinks", newDataItem, d);
            if (newDataItem[d] === null) {
              newDataItem[d] = null;
              data[d] = null;
            } else {
              const targetData: any = await this.#db(match[1])
                .select("id")
                .where("guid", newDataItem[d]);

              if (targetData.length == 1) {
                newDataItem[d] = targetData[0].id;
                data[d] = parseInt(targetData[0].id);
              } else {
                if (targetData.length > 1) {
                  throw "Nalezeno guid pro vice linku";
                } else {
                  throw "Nenalezen guid pro link";
                }
              }
            }
          }
        }
      }
    }
    return { dataItem: newDataItem, joinsIds, data };
  };

  insert = async ({
    entity,
    data,
  }: {
    entity: string;
    data: Object | Object[];
  }) => {
    if (entity) {
      if (this.#schema[entity]) {
        const dataArray = Array.isArray(data) ? data : [data];

        let retData: any = [];
        for (let dataItem of dataArray) {
          console.log("call getLinks");
          const gl = await this.getLinks(entity, dataItem);
          console.log("finish call getLinks");
          let joinsIds = gl.joinsIds;
          dataItem = gl.dataItem;
          //
          const ret: any = await this.#db(entity)
            .addParams({ data: gl.data })
            .insert(dataItem);

          // add nlink joins
          for (let table of Object.keys(joinsIds)) {
            const joinData = joinsIds[table].map((jid: any) => {
              return { source: ret[0].id, target: jid.id };
            });

            await this.#db(table).insert(joinData);
          }

          retData = retData.concat(ret);
        }
        //
        //.returning("*");

        return retData;
      } else {
        throw `Entity ${entity} not exists`;
      }
    } else {
      throw `Entity not found`;
    }
  };

  update = async ({
    entity,
    data,
    where,
  }: {
    entity: string;
    data: any;
    where: any;
  }) => {
    if (entity) {
      if (this.#schema[entity]) {
        const gl = await this.getLinks(entity, data);
        const joinsIds = gl.joinsIds;
        const dataItem: any = gl.dataItem;

        const query = this.#db(entity);

        await addWhere({
          where,
          schema: this.#schema,
          db: this.#db,
          entity,
          query,
          user: this.user,
        });
        const updateIdsData = await query.select(MAIN_ID);
        const idForDeleteIfIsJoinEmpty = updateIdsData.map((u) => u[MAIN_ID]);

        // add nlink joins
        const beforeDataNlinks: any = {};
        for (let table of Object.keys(joinsIds)) {
          const newJoinData: any = [];
          joinsIds[table].map((jid: any) => {
            updateIdsData.map((u) => {
              newJoinData.push({ source: u[MAIN_ID], target: jid[MAIN_ID] });
            });
          });

          const uniqueSources = _.uniq(_.map(newJoinData, "source"));
          const dbTargets = await this.#db(table)
            .select(["source", "target"])
            .whereIn(
              "source",
              joinsIds[table].length == 0
                ? idForDeleteIfIsJoinEmpty
                : uniqueSources
            );

          const joinField = table.split("4")[1];
          const beforeDataTmp = _.groupBy(dbTargets, "source");
          const beforeData = _.map(beforeDataTmp, (items, source) => ({
            [MAIN_ID]: source,
            [joinField]: _.map(items, "target"),
          }));
          beforeDataNlinks[table] = beforeData;

          const targetInsert = _.differenceWith(
            newJoinData,
            dbTargets,
            _.isEqual
          );
          const targetDelete = _.differenceWith(
            dbTargets,
            newJoinData,
            _.isEqual
          );
          if (targetDelete.length > 0) {
            const delQuery = this.#db(table);
            targetDelete.map((td) => {
              delQuery.orWhere(td);
            });
            await delQuery.delete();
          }
          if (targetInsert.length > 0) {
            await this.#db(table).insert(targetInsert);
          }
        }

        if (Object.keys(dataItem).length === 0) {
          if (where.guid) {
            dataItem.guid = where.guid;
          } else {
            dataItem.guid = this.#knex.raw("??", ["guid"]);
          }
        }
        const ret = await query
          .update(dataItem)
          .addParams({ data: gl.data, beforeDataNlinks: beforeDataNlinks });

        return ret;
      } else {
        throw `Entity ${entity} not exists`;
      }
    } else {
      throw `Entity not found`;
    }
  };

  delete = async ({ entity, where }: { entity: string; where: any }) => {
    if (entity) {
      if (this.#schema[entity]) {
        const query = this.#db(entity);

        await addWhere({
          where,
          schema: this.#schema,
          db: this.#db,
          entity,
          query,
          user: this.user,
        });

        const ret = await query.delete();

        return ret;
      } else {
        throw `Entity ${entity} not exists`;
      }
    } else {
      throw `Entity not found`;
    }
  };
}
