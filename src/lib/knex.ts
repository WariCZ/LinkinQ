import knex, { Knex } from "knex";

const configDb: Knex.Config = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
    ...(process.env.DATABASE_URL
      ? {}
      : {
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT ?? "5432", 10),
          user: process.env.DB_USER || "prisma",
          password: process.env.DB_PASSWORD || "prisma",
          database: process.env.DB_DATABASE || "prodigi",
        }),
  },
  // debug: true,
  migrations: {
    // directory: "./migrations",
  },
  seeds: {
    // directory: "./seeds",
  },
};

export const MAIN_ID = "id";

export const db = knex(configDb);

// Typ pro vstupní objekt
interface QueryObject {
  [key: string]: any;
}

// Funkce pro přípravu podmínek
export function prepareConditions(queryObj: QueryObject): {
  conditions: string[];
  values: any[];
} {
  const conditions: string[] = [];
  const values: any[] = [];

  for (const key in queryObj) {
    if (queryObj.hasOwnProperty(key)) {
      const value = queryObj[key];

      // Pokud klíč obsahuje tečku
      if (key.includes(".")) {
        const parts = key.split(".");

        // Přidání obou možností do podmínek (pro objekt i pro pole)
        const condition = `(${parts[0]}->>'${parts[1]}' = ? OR EXISTS (SELECT 1 FROM jsonb_array_elements(${parts[0]}) AS elem WHERE elem->>'${parts[1]}' = ?))`;
        conditions.push(condition);
        // Přidáme dvakrát hodnotu – jednou pro objekt, podruhé pro pole
        values.push(value, value);
      } else {
        // Pokud není tečka, přidáme běžný klíč
        const condition = `${key} = ?`;
        conditions.push(condition);
        values.push(value);
      }
    }
  }

  return { conditions, values };
}

db.registerTriggers({
  before: async function (runner) {
    if (["insert", "update", "del"].indexOf(runner.builder._method) > -1) {
      // console.log("before", runner.builder._method);
      if (
        runner.builder._method == "insert" &&
        runner.builder._single.table == "users"
      ) {
        if (
          !Array.isArray(runner.builder._single.insert) &&
          runner.builder._single.insert.fullname &&
          !runner.builder._single.insert.caption
        ) {
          runner.builder._single.insert.caption =
            runner.builder._single.insert.fullname;
          // } else {
          //   runner.builder._single.insert.map( row => {
          //     ro
          //   })
        }
      }
      return { kuk: "kuk" };
      // if (
      //   runner.builder._method == "update" ||
      //   runner.builder._method == "del"
      // ) {
      //   const sql = runner.builder.toSQL() as any;
      //   // TODO: generovani where by bylo vhodne zmenit na generovani ktere probiha pomoci querybuilderu
      //   const w = sql.sql.match(/where(.*?)(returning|$)/i);
      //   if (w && w[1]) {
      //     const whereRaw = w[1].replace("where ", "");
      //     const bindsLength = _.countBy(sql.sql)["?"] || 0;
      //     const whereBindsLength = _.countBy(whereRaw)["?"] || 0;
      //     const selectBinds = sql.bindings.slice(
      //       bindsLength - whereBindsLength
      //     );

      //     const table = runner.builder._single.table;
      //     const beforeData = await db(table)
      //       .select("*")
      //       .whereRaw(whereRaw, selectBinds);
      //     console.log("beforeData", beforeData);
      //     return beforeData;
      //   }
      // }
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
      console.log("after", /*runner,*/ beforeData);
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
