import knex, { Knex } from "knex";
import knexConfig from "./config";
// import logger from "../../lib/logger/";
import _ from "lodash";
// import { callTrigger } from "./triggers";

export const MAIN_ID = "id";

export const db = knex(knexConfig);

db.registerTriggers({
  before: async function (runner) {
    if (["insert", "update", "del"].indexOf(runner.builder._method) > -1) {
      console.log("before", runner.builder._method);
      // console.log("queryData", runner);
      if (
        runner.builder._method == "update" ||
        runner.builder._method == "del"
      ) {
        const sql = runner.builder.toSQL() as any;
        // TODO: generovani where by bylo vhodne zmenit na generovani ktere probiha pomoci querybuilderu
        const w = sql.sql.match(/where(.*?)(returning|$)/i);
        if (w && w[1]) {
          const whereRaw = w[1].replace("where ", "");
          const bindsLength = _.countBy(sql.sql)["?"] || 0;
          const whereBindsLength = _.countBy(whereRaw)["?"] || 0;
          const selectBinds = sql.bindings.slice(
            bindsLength - whereBindsLength
          );

          const table = runner.builder._single.table;
          const beforeData = await db(table)
            .select("*")
            .whereRaw(whereRaw, selectBinds);
          console.log("beforeData", beforeData);
          return beforeData;
        }
      }
    }
    //
    //
    // if (runner.builder._single.table == "wari" && sql.method == "update") {
    //   debugger;
    //   //////
    //   var ret = await db("users")
    //     .insert({ username: "rrrrr" })
    //     .returning(MAIN_ID);
    //   console.log("ret", ret);
    //   runner.builder._single.update.link = ret[0].id;
    //   debugger;
    // }
    return;
  },
  after: async function (runner, beforeData) {
    if (["insert", "update", "del"].indexOf(runner.builder._method) > -1) {
      console.log(runner, beforeData);
    }
    //
    //
    //   console.log("runner", runner);
    //   debugger;
    //   var ret = await db("users").insert({ username: "rrrrr" }).returning("id");

    //   console.log("ret", ret);
    //   return;
  },
  // after: async function (runner) {
  //   debugger;
  //   return await db("users").select("username").where({ id: 3 });
  // },
});
