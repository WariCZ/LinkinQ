import {
  Configuration,
  //   ModelsDatastore,
  //   ModelsDatastoreDB,
  //   DataStore,
  Logger,
  NoCacheManager,
  CacheManager,
  ScriptHandler,
} from "./";

import { ModelsDatastore, DataStore } from "./datastore";
import { MyAppDelegate } from "./appDelegate";
// import { UserService } from "../userAccess/UserService";

// import { db } from "../db/knex";
// import { up } from "../db/migration";

const dotenv = require("dotenv");

dotenv.config();
const templatesPath = __dirname + "/emailTemplates/";

var configuration = new Configuration({
  definitionsPath: process.env.DEFINITIONS_PATH,
  templatesPath: templatesPath,
  timers: {
    //forceTimersDelay: 1000,
    precision: 3000,
  },
  database: {
    // MongoDB: {
    //   db_url: process.env.MONGO_DB_URL, //"mongodb://localhost:27017?retryWrites=true&w=majority",
    // },
  },
  apiKey: process.env.API_KEY,
  /* Define Server Services */
  logger: function (server: any) {
    new Logger(server);
  },
  definitions: function (server: any) {
    return new ModelsDatastore(server);
  },
  appDelegate: function (server: any) {
    return new MyAppDelegate(server);
  },
  dataStore: function (server: any) {
    let ds = new DataStore(server);
    ds.enableSavePoints = true;
    return ds;
  },
  scriptHandler: function (server: any) {
    return new ScriptHandler();
  },
  cacheManager: function (server: any) {
    return new NoCacheManager(server);
  },
});

export { configuration };