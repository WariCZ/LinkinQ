import express, {
  Request,
  Response,
  NextFunction,
  Express,
  Router,
} from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
import compression from "compression";
import dotenv from "dotenv";

import logger from "../lib/logger";
import { EntityRoutes } from "../lib/entity/routes";
import authRoutes, { authenticate } from "../lib/auth";
import { EntitySchema } from "../lib/entity/types";

import { Sql } from "../lib/entity/sql";
import { Adapters } from "../lib/entity/adapters";
import { mailAdapter } from "../configurations/adapters/mail";
import { BpmnRoutes } from "../lib/bpmn-web/routes";
import {
  BPMNServer,
  getBPMNConfigurations,
  BPMNAPI,
  Logger,
} from "../lib/bpmn-web";

import { loadConfigurations } from "../lib/configurations";
import fs from "fs";
import path from "path";
import _ from "lodash";
import pageflowRouter from "../lib/pageflow";

const dirname = __dirname;

dotenv.config();

type LinkinqPlugin = { triggers: any[]; processes: any[] };

type LinkinqConfig = { plugins: LinkinqPlugin[] };

export class Linkinq {
  app: Express;
  entity: EntityRoutes;
  bpmnRoutes: any;
  bpmnServer: any;
  packageJson;
  viteRunning: boolean;
  ad: Adapters;

  constructor(config?: LinkinqConfig) {
    this.viteRunning = false;
    const configPath = dirname + "/../package.json";
    if (fs.existsSync(configPath)) {
      this.packageJson = JSON.parse(fs.readFileSync(configPath, "utf8"));
      var _version = this.packageJson["version"];
      logger.info("Prodigi-node version " + _version);
    }

    this.app = this.initExpress();

    this.entity = new EntityRoutes();

    console.log("Before start adapter");
    this.ad = new Adapters({
      db: this.entity.db,
      eventsOnEntities: this.entity.eventsOnEntities,
    });

    this.ad.registerAdapter({ adapter: mailAdapter });

    console.log("After start adapter");
  }

  async initApp() {
    try {
      const configurations = await loadConfigurations();

      const { schema, sqlAdmin, db } = await this.entity.prepareSchema(
        configurations
      );

      this.ad.loadAdapters(schema);
      const wflogger = new Logger({ toConsole: true });

      const BPMNConfiguration = getBPMNConfigurations(configurations.processes);
      this.bpmnServer = new BPMNServer(BPMNConfiguration, wflogger);

      const bpmnAPI = new BPMNAPI(this.bpmnServer);

      this.entity.triggers.startWorkflow = async ({ table, data }) => {
        const models = await sqlAdmin.select({
          entity: "wf_models",
          fields: ["id", "name", "filter", "default"],
          where: {
            entity: table,
          },
          orderBy: ["ordering"],
        });

        if (models.length > 0) {
          let defaultModel;

          const filteredModels = models.filter((m) => {
            if (m.default) {
              defaultModel = m;
            }
            if (m.filter) {
              return _.isMatch(data, m.filter);
            } else {
              return true;
            }
          });
          let mod =
            filteredModels.length > 0 ? filteredModels[0] : defaultModel;

          if (!mod) {
            mod = filteredModels[0] || models[0];
          }

          let caseId = Math.floor(Math.random() * 10000);
          let context = await bpmnAPI.engine.start(
            mod.name,
            { caseId: caseId++ },
            { userName: "admin" } as any
          );

          const entityData = {};
          // const context = {
          //   instance: { dbId: "1500b584-fa8a-4a3c-8fa4-92f9991db78b" },
          // };
          Object.keys(context.item.element.def.$attrs).forEach((attr) => {
            if (attr.indexOf("linkinq:") > -1) {
              entityData[attr.replace("linkinq:", "")] =
                context.item.element.def.$attrs[attr];
            }
          });
          return {
            id: (context.instance as any).dbId,
            data: entityData,
          };
        }
      };

      this.bpmnRoutes = new BpmnRoutes({
        bpmnAPI,
        sqlAdmin,
        bpmnServer: this.bpmnServer,
        schema,
        db,
      });

      this.setupExpress({
        schema,
        sqlAdmin,
        configurations,
      });
    } catch (err) {
      debugger;
      console.error(err?.stack || err?.message || err);
      throw err?.stack || err?.message || err;
    }
  }

  initExpress(): Express {
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

  setupExpress({
    schema,
    sqlAdmin,
    configurations,
  }: {
    schema: EntitySchema;
    sqlAdmin: Sql;
    configurations: any;
  }) {
    const app = this.app;

    this.setupRoutes({ schema, sqlAdmin, configurations });

    // const DEFAULT_VITE_PATH = "vite.config.ts";
    // const VITE_PATH_LINKINQ = path.join(__dirname, "../../", DEFAULT_VITE_PATH);

    /**
     * Error Handler.
     */
    if (process.env.NODE_ENV === "development") {
      // only use in development
      ViteExpress.config({
        // viteConfigFile: VITE_PATH_LINKINQ,
      });
    } else {
      app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(err);
        res.status(500).send("Server Error");
      });
      ViteExpress.config({
        mode: "production",
        // viteConfigFile: VITE_PATH_LINKINQ,
      });
    }

    ViteExpress.listen(app, parseInt(process.env.PORT), () => {
      console.log(
        `App is running at http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode`
      );
      this.viteRunning = true;
      console.log("  Press CTRL-C to stop\n");
    });

    return app;
  }

  setupRoutes({
    schema,
    sqlAdmin,
    configurations,
  }: {
    schema: EntitySchema;
    sqlAdmin: Sql;
    configurations: any;
  }) {
    const app = this.app;

    if (process.env.NODE_ENV === "development") {
      app.use(this.waitForViteMiddleware);
    }

    // app.use("/workflow", async (req: Request, res: Response) => {
    //   debugger;
    //   const definitions = this.bpmnServer.definitions;
    //   const xml = await definitions.getSource("Cash Request");
    //
    //   console.log("xml", xml);
    // });
    app.use("/", authRoutes({ schema, sqlAdmin }));
    app.use("/pageflow", pageflowRouter(configurations.pageflow));
    app.use("/api", authenticate, this.entity.config());
    app.use("/bpmnapi", authenticate, this.bpmnRoutes.config());
    app.use("/adapters", authenticate, this.ad.configRoutes());

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
    let key = argv[i];
    let val;
    if (key.indexOf("=")) {
      const a = key.split("=");

      key = a[0];
      val = a[1];
    } else {
      val = argv[++i];
    }
    process.env[key] = val;
  }
}

setupEnvVars();
