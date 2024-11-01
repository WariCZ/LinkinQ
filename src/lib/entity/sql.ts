import { Knex } from "knex";
import { addWhere, getData, getQueries } from "./methodsDB";
import { EntitySchema } from "./types";
import { User } from "../auth";
import { concat } from "lodash";

export type dbType = (table: string) => Knex.QueryBuilder<any, unknown[]>;
export class Sql {
  #schema: EntitySchema = {};
  #db: dbType; //Knex.QueryBuilder<any, unknown[]>;

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
    this.#db = (table: string) => db(table).setUser(user);
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
          let joinsIds: any = {};
          for (let d of Object.keys(data)) {
            if (this.#schema[entity].fields[d].type.indexOf("link(") > -1) {
              const match =
                this.#schema[entity].fields[d].type.match(/.*link\((\w+)\)/);
              if (match && match[0].indexOf("nlink") > -1 && match[1]) {
                const joinTable = entity + "2" + match[1] + "4" + d;

                const targetIds = await this.#db(match[1])
                  .select("id")
                  .whereIn(
                    "guid",
                    Array.isArray(dataItem[d]) ? dataItem[d] : [dataItem[d]]
                  );
                joinsIds[joinTable] = targetIds;
                delete dataItem[d];
              } else if (match && match[0].indexOf("link") > -1 && match[1]) {
              }
            }
          }

          const ret: any = await this.#db(entity).insert(dataItem);

          // add nlink joins
          for (let table of Object.keys(joinsIds)) {
            const joinData = joinsIds[table].map((jid: any) => {
              return { source: ret[0].id, target: jid.id };
            });

            await this.#db(table).insert(joinData).returning("*");
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
        const query = this.#db(entity);

        await addWhere({
          where,
          schema: this.#schema,
          db: this.#db,
          entity,
          query,
        });

        const ret = await query.update(data).returning("*");

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
        });

        const ret = await query.delete().returning("*");

        return ret;
      } else {
        throw `Entity ${entity} not exists`;
      }
    } else {
      throw `Entity not found`;
    }
  };
}
