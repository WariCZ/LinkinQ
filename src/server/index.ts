import express, { Request, Response, NextFunction, Express } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";

import logger from "../lib/logger";
import { db } from "../lib/knex";
import entityRoutes from "../lib/entity";
import authRoutes from "../lib/auth";
import { EntitySchema } from "../lib/entity/types";
import { BPMNServer, configuration } from "../lib/bpmn-web";

import {
  checkSchema,
  createEntity,
  deleteEntity,
  createFieldTable,
  createField,
} from "../lib/entity/manageEntities";

import { up } from "../lib/bpmn-web/migration";

dotenv.config();

// declare global {
//   var prodigi: {
//     entityModel: EntitySchema;
//   };
// }

// const schema = checkSchema();
// console.log("schema", schema);

// const app = express();
// const PORT = parseInt(process.env.PORT || "3131", 10);

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use("/", authRoutes);

// app.use("/entity", entityRoutes);

// app.get("/protected2", (req: Request, res: Response) => {
//   res.json({ message: "This is a protected route", user: req.user });
// });

// ViteExpress.listen(app, PORT, () =>
//   console.log(`Server is listening port ${PORT}...`)
// );

export class WebApp {
  app: Express;
  // userManager;
  bpmnServer: any;
  packageJson;

  constructor() {
    const fs = require("fs");

    const configPath = __dirname + "/../package.json";
    if (fs.existsSync(configPath)) {
      this.packageJson = JSON.parse(fs.readFileSync(configPath, "utf8"));
      var _version = this.packageJson["version"];
      console.log("Prodigi-node version " + _version);
    }

    this.app = this.initExpress();

    // this.userManager = new UserManager(this.app);

    // this.userManager.init();
    console.log(configuration);
    this.bpmnServer = new BPMNServer(configuration);
    // this.bpmnServer.appDelegate..winSocket = null;

    this.setupExpress();
  }

  initExpress() {
    const app = express();
    /**
     * Express configuration.
     */
    app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
    app.set(
      "port",
      process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000
    );
    app.use(compression());

    app.use(bodyParser.json({ limit: "200mb" }));
    app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
    // app.use(cookieParser());

    // app.use(busboy());

    return app;
  }

  setupExpress() {
    const app = this.app;

    this.setupRoutes();

    /**
     * Error Handler.
     */
    if (process.env.NODE_ENV === "development") {
      // only use in development
    } else {
      app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err);
        res.status(500).send("Server Error");
      });
    }

    // up(db).then(() => {
    ViteExpress.listen(app, app.get("port"), () => {
      console.log(
        "App is running at http://localhost:%s in %s mode",
        app.get("port"),
        app.get("env")
      );
      console.log("  Press CTRL-C to stop\n");
    });
    // });

    return app;
  }

  setupRoutes() {
    var router = express.Router();
    var root = path.join(__dirname, "../");

    router.get("/protected2", (req: Request, res: Response) => {
      res.json({ message: "This is a protected route", user: req.user });
    });
  }
}

/** Main logic
 */
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
function setupEnvVars() {
  dotenv.config();
  var argv = process.argv;
  var args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    const val = argv[++i];
    process.env[key] = val;
  }
}

setupEnvVars();

const webApp = new WebApp();

module.exports = webApp.app;
