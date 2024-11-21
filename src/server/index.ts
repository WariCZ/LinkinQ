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
import { BPMNServer, configuration, BPMNAPI, Logger } from "../lib/bpmn-web";
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
    // console.log("ENV", process.env);
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
      .then(async ({ schema, sqlAdmin }) => {
        const wflogger = new Logger({ toConsole: true });
        this.bpmnServer = new BPMNServer(configuration, wflogger);

        const bpmnAPI = new BPMNAPI(this.bpmnServer);

        this.entity.triggers.startWorkflow = async ({ table, data }) => {
          var caseId = Math.floor(Math.random() * 10000);
          let context = await bpmnAPI.engine.start(
            "Cash Request",
            { caseId: caseId++ },
            { userName: "admin" } as any
          );
          return (context.instance as any).dbId;
        };

        // console.log("context", context);
        this.setupExpress({ schema, sqlAdmin });
      })
      .catch((e) => {
        // debugger;

        logger.error(e);
        if (e.stack) logger.error(e.stack);
      });
  }

  // router.post("/runWorkflow", async (req: Request, res: Response) => {
  //   try {
  //     if (req.user) {
  //       debugger;
  //       this.
  //       let processName = "Cash Request";
  //       // req.session.processName = processName;
  //       let context = await bpmnAPI.engine.start(
  //         processName,
  //         { caseId: 1 },
  //         1
  //       );
  //     } else {
  //       res.sendStatus(401);
  //     }
  //   } catch (error: any) {
  //     debugger;
  //     console.error("Error fetching data from external API:", error?.stack);
  //     res.status(500).send("Error fetching data from external API");
  //   }
  // });

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
      ViteExpress.config({ mode: "production" });
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

const webApp = new WebApp();

module.exports = webApp.app;
