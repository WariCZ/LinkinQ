import express, { Request, Response, NextFunction, Express } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";

import logger from "../lib/logger";
import { EntityRoutes } from "../lib/entity/routes";
import authRoutes from "../lib/auth";
import { EntitySchema } from "../lib/entity/types";
import { BPMNServer, configuration } from "../lib/bpmn-web";

import { Entity } from "../lib/entity/";

dotenv.config();

// const schema = checkSchema();
// console.log("schema", schema);

// app.use("/", authRoutes);

// app.use("/entity", entityRoutes);

declare global {
  var prodigi: {
    entityModel: EntitySchema;
  };
}

export class WebApp {
  app: Express;
  entity: EntityRoutes;
  // userManager;
  bpmnServer: any;
  packageJson;

  constructor() {
    const fs = require("fs");

    const configPath = __dirname + "/../package.json";
    if (fs.existsSync(configPath)) {
      this.packageJson = JSON.parse(fs.readFileSync(configPath, "utf8"));
      var _version = this.packageJson["version"];
      logger.info("Prodigi-node version " + _version);
    }

    this.app = this.initExpress();

    // this.userManager = new UserManager(this.app);

    // this.userManager.init();

    this.entity = new EntityRoutes();

    // //
    this.entity
      .prepareSchema()
      .then((schema) => {
        logger.debug("Call setupExpress -------------------");
        this.bpmnServer = new BPMNServer(configuration, logger as any);
        this.setupExpress();
      })
      .catch((e) => {
        debugger;
        // logger.error(e.message);
        logger.error(e);
        if (e.stack) logger.error(e.stack);
        // //
      });

    //
    // this.bpmnServer.appDelegate..winSocket = null;
    // checkSchema().then((schema) => {
    //   logger.debug("Call setupExpress");
    //   this.setupExpress();
    // });
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
    app.use(cookieParser());

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
        logger.error(err);
        res.status(500).send("Server Error");
      });
    }

    ViteExpress.listen(app, app.get("port"), () => {
      logger.info(
        "App is running at http://localhost:%s in %s mode",
        app.get("port"),
        app.get("env")
      );
      logger.info("  Press CTRL-C to stop\n");
    });

    return app;
  }

  setupRoutes() {
    var root = path.join(__dirname, "../");

    const app = this.app;

    app.use("/", authRoutes);
    app.use("/entity", this.entity.config());

    app.get("/protected2", (req: Request, res: Response) => {
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
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    const val = argv[++i];
    process.env[key] = val;
  }
}

setupEnvVars();

const webApp = new WebApp();

module.exports = webApp.app;
