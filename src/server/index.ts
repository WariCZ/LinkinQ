import express, { Request, Response, NextFunction, Express } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";

import logger from "../lib/logger";
import { EntityRoutes } from "../lib/entity/routes";
import authRoutes, { authenticate } from "../lib/auth";
import { EntitySchema } from "../lib/entity/types";
import { BPMNServer, configuration } from "../lib/bpmn-web";
import { Sql } from "@/lib/entity/sql";

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
  viteRunning: boolean;

  constructor() {
    this.viteRunning = false;
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
    //
    this.entity
      .prepareSchema()
      .then(({ schema, sqlAdmin }) => {
        logger.debug("Call setupExpress -------------------");
        this.bpmnServer = new BPMNServer(configuration, logger as any);
        this.setupExpress({ schema, sqlAdmin });
      })
      .catch((e) => {
        // debugger;
        // logger.error(e.message);
        logger.error(e);
        if (e.stack) logger.error(e.stack);
        // //
      });
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

  waitForViteMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const maxRetries = 10; // Maximální počet pokusů
    const retryDelay = 1000; // Zpoždění mezi pokusy v milisekundách

    for (let i = 0; i < maxRetries; i++) {
      try {
        if (this.viteRunning) {
          return next();
        } else {
          console.log(`Waiting for Vite server... (${i + 1}/${maxRetries})`);
          // Čekáme před dalším pokusem
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      } catch (error: any) {
        console.error(error.stack);
      }
    }

    // Pokud se nepodaří Vite server nastartovat, ukončíme požadavek s chybou
    res
      .status(500)
      .send("Vite server failed to start within the expected time.");
  };

  setupExpress({ schema, sqlAdmin }: { schema: EntitySchema; sqlAdmin: Sql }) {
    const app = this.app;

    this.setupRoutes({ schema, sqlAdmin });

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
      this.viteRunning = true;
      logger.info("  Press CTRL-C to stop\n");
    });

    return app;
  }

  setupRoutes({ schema, sqlAdmin }: { schema: EntitySchema; sqlAdmin: Sql }) {
    const app = this.app;

    if (process.env.NODE_ENV === "development") {
      app.use(this.waitForViteMiddleware);
    }

    // app.use("/workflow", async (req: Request, res: Response) => {
    //   debugger;
    //   const definitions = this.bpmnServer.definitions;
    //   const xml = await definitions.getSource("Cash Request");
    //   console.log("xml", xml);
    // });
    app.use("/", authRoutes({ schema, sqlAdmin }));
    app.use("/api", authenticate, this.entity.config());

    app.get("/protected2", authenticate, (req: Request, res: Response) => {
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
