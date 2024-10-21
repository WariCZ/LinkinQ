import express from "express";
import type { NextFunction, Request, Response } from "express";
import { getData, getQueries } from "./methodsDB";

import { apiError } from "../logger";
import _ from "lodash";
import { Entity } from ".";
import { authenticateWithMultipleStrategies } from "../auth";
import { DateTime } from "luxon";
import { Sql } from "./sql";

export type ServerSideOutputType = {
  time: string;
  type: "log" | "error";
  msg: string;
};

export class EntityRoutes extends Entity {
  validateEntityBody({ body }: { body: any }) {
    if (Array.isArray(body)) {
      return "Array is not supported";
    }

    return;
  }

  config() {
    const router = express.Router();

    router.post("/run-code", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          const { code } = req.body;

          try {
            const testFnc = (d: any) => {
              return d + "-KUK";
            };

            const newCode = code.replace("console.log(", "show(");
            const output: ServerSideOutputType[] = [];
            const show = (...argv: any) => {
              console.log(argv);

              output.push({
                time: DateTime.now().toFormat("dd.MM.yyyy HH:mm:ss.SSS"),
                type: "log",
                msg: argv.join(", "),
              });
            };

            const sql = new Sql({
              db: this.db,
              schema: this.schema,
              user: req.user,
            });

            const fnc = new Function(
              "test",
              "show",
              "sql",
              `
          return (async () => {
              ${newCode}
          })();
      `
            );

            const out = await fnc(testFnc, show, sql);

            const o = typeof out ? JSON.stringify(out) : out;
            output.push({
              time: DateTime.now().toFormat("dd.MM.yyyy HH:mm:ss.SSS"),
              type: "log",
              msg: o || "Ready without output",
            });
            res.json({ success: true, output });
          } catch (error: any) {
            const errStack = error.stack || error;

            let lines;
            if (errStack) {
              lines = [...errStack.matchAll(/<anonymous>:(\d+):(\d+)/gm)];
              lines = lines && lines[0];
            }

            res.status(400).json({
              success: false,
              message: {
                time: DateTime.now().toFormat("dd.MM.yyyy HH:mm:ss.SSS"),
                type: "error",
                msg: error.message || error,
              },
              line: (lines && lines[1]) || 1,
              column: (lines && lines[2]) || 1,
            });
          }
        } else {
          res.sendStatus(401);
        }
      } catch (error) {
        console.error("Error fetching data from external API:", error);
        res.status(500).send("Error fetching data from external API");
      }
    });

    // Route pro Server-Sent Events
    router.get("/events", (req: Request, res: Response) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Content-Encoding", "none");

      this.eventsOnEntities.on("afterTrigger", (msg) => {
        res.write(`data: ${JSON.stringify(msg)}\n\n`);
      });

      // Vyčistění interval po ukončení spojení
      req.on("close", () => {
        res.end();
      });
    });

    router.get(
      "/entity/:entity",
      authenticateWithMultipleStrategies(["local", "basic"]),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            try {
              const sql = new Sql({
                db: this.db,
                schema: this.schema,
                user: req.user,
              });

              const fields = (req.query.__fields + ",guid" || "*").split(",");

              const ret = await sql.select({
                entity: req.params.entity,
                fields,
                where: _.omit(req.query as any, ["entity", "__fields"]),
              });
              return res.json(ret);
            } catch (e: any) {
              debugger;
              console.error(e);
              //TODO: Stalo by za uvahu nejakym zpusobem chybu omezit aby se neposilala chyba takto detailne
              return apiError({ res, error: e.message || e });
            }
          } else {
            res.sendStatus(401);
          }
        } catch (error) {
          console.error("Error fetching data from external API:", error);
          res.status(500).send("Error fetching data from external API");
        }
      }
    );

    // INSERT
    router.post(
      "/entity/:entity",
      authenticateWithMultipleStrategies(["local", "basic"]),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            const sql = new Sql({
              db: this.db,
              schema: this.schema,
              user: req.user,
            });

            const ret = await sql.insert({
              entity: req.params.entity,
              data: req.body,
            });

            return res.json(ret);
          } else {
            res.sendStatus(401);
          }
        } catch (error: any) {
          debugger;
          console.error("Error fetching data from external API:", error?.stack);
          res.status(500).send("Error fetching data from external API");
        }
      }
    );

    // UPDATE
    router.put(
      "/entity/:entity",
      authenticateWithMultipleStrategies(["local", "basic"]),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            const sql = new Sql({
              db: this.db,
              schema: this.schema,
              user: req.user,
            });
            const ret = await sql.update({
              entity: req.params.entity,
              where: _.omit(req.query as any, ["entity", "__fields"]),
              data: req.body,
            });

            return res.json(ret);
          } else {
            res.sendStatus(401);
          }
        } catch (error: any) {
          debugger;
          console.error("Error fetching data from external API:", error?.stack);
          res.status(500).send("Error fetching data from external API");
        }
      }
    );

    // UPDATE
    router.delete(
      "/entity/:entity",
      authenticateWithMultipleStrategies(["local", "basic"]),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            const sql = new Sql({
              db: this.db,
              schema: this.schema,
              user: req.user,
            });
            const ret = await sql.delete({
              entity: req.params.entity,
              where: _.omit(req.query as any, ["entity", "__fields"]),
            });

            return res.json(ret);
          } else {
            res.sendStatus(401);
          }
        } catch (error: any) {
          debugger;
          console.error("Error fetching data from external API:", error?.stack);
          res.status(500).send("Error fetching data from external API");
        }
      }
    );

    return router;
  }
}
