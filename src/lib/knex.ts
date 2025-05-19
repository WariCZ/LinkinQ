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
          user: process.env.DB_USER || "linkinq",
          password: process.env.DB_PASSWORD || "linkinq",
          database: process.env.DB_DATABASE || "linkinq",
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
export const MAIN_GUID = "guid";
export const MAIN_TABLE_ALIAS = "t";

let dbInstance = null;
export const db = () => {
  if (!dbInstance) {
    dbInstance = knex(configDb);
  }
  return dbInstance;
};

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
