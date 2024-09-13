import knex, { Knex } from "knex";
import knexConfig from "./config";
// import logger from "../../lib/logger/";
// import _ from "lodash";
// import { callTrigger } from "./triggers";

export const MAIN_ID = "id";

export const db = knex(knexConfig);
