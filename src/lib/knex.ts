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
