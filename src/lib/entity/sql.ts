import { Knex } from "knex";
import { getData, getQueries } from "./methodsDB";
import { EntitySchema } from "./types";
import { User } from "../auth";

export class Sql {
  #schema: EntitySchema = {};
  #db: Knex.QueryBuilder<any, unknown[]>;

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
    this.#db = db.setUser(user);
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
          // orderBy: orderBy,
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

  insert = async ({ entity, data }: { entity: string; data: any }) => {
    if (entity) {
      if (this.#schema[entity]) {
        const ret = this.#db.from(entity).insert(data); //.returning("*");

        return ret;
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
    where: Object;
  }) => {
    if (entity) {
      if (this.#schema[entity]) {
        const ret = this.#db.from(entity).where(where).update(data); //.returning("*");

        return ret;
      } else {
        throw `Entity ${entity} not exists`;
      }
    } else {
      throw `Entity not found`;
    }
  };

  delete = async ({ entity, where }: { entity: string; where: Object }) => {
    if (entity) {
      if (this.#schema[entity]) {
        const ret = this.#db.from(entity).where(where).delete(); //.returning("*");

        return ret;
      } else {
        throw `Entity ${entity} not exists`;
      }
    } else {
      throw `Entity not found`;
    }
  };
}
