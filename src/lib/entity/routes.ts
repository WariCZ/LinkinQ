import express from "express";
import type { NextFunction, Request, Response, Router } from "express";

import { apiError } from "../logger";
import _ from "lodash";
import { Entity } from ".";
import { DateTime } from "luxon";
import { Sql } from "./sql";
import { addDefaultFields } from "./utils";
import multer from "multer";

export type ServerSideOutputType = {
  time: string;
  type: "log" | "error";
  msg: string;
};

//tady
const upload = multer(); // Ukládá soubory pouze do paměti

export class EntityRoutes extends Entity {
  config(): Router {
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
              user: req.user as any,
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

    router.get("/entity/:entity", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          try {
            const sql = new Sql({
              db: this.db,
              schema: this.schema,
              user: req.user as any,
            });

            const fields = (
              req.query.__fields ? req.query.__fields + ",guid,id" : "*"
            ).split(",");

            const orderBy =
              req.query.__orderby && typeof req.query.__orderby === "string"
                ? req.query.__orderby.split(",")
                : undefined;

            const limit = req.query.__limit
              ? parseInt(req.query.__limit as string)
              : undefined;

            const offset = req.query.__offset
              ? parseInt(req.query.__offset as string)
              : undefined;

            const structure = (
              req.query.__structure ? req.query.__structure : undefined
            ) as "topdown" | undefined;

            // const structure = "topdown" as "topdown" | undefined;
            if (!(!structure || structure === "topdown")) {
              throw `Query with structure ${structure} is not supported `;
            }

            // const x = await this.db
            //   .setUser({ id: 1 })
            //   .withRecursive("task_tree", (cte) => {
            //     // ROOT: najdi všechny tasky bez parenta, ale v daném projektu
            //     cte
            //       .setUser({ id: 1 })
            //       .select(
            //         "id",
            //         "caption",
            //         "parent",
            //         "createdby",
            //         this.db.raw("1 as depth").setUser({ id: 1 })
            //       )
            //       .from("tasks")
            //       // .where('project_id', projectId)
            //       .whereNull("parent")

            //       // REKURZE: najdi childy k uzlům ze stromu
            //       .unionAll(function () {
            //         this.select(
            //           "t.id",
            //           "t.caption",
            //           "t.parent",
            //           "t.createdby",
            //           that.db.raw("task_tree.depth + 1").setUser({ id: 1 })
            //         )
            //           .from("tasks as t")
            //           .join("task_tree", "t.parent", "task_tree.id");
            //       });
            //   })
            //   .select("*")
            //   .from("task_tree")
            //   .orderBy("depth", "asc");

            const ret = await sql.select({
              entity: req.params.entity,
              fields,
              orderBy,
              limit,
              offset,
              structure,
              where: _.omit(req.query as any, [
                "entity",
                "__fields",
                "__orderby",
                "__limit",
                "__offset",
                "__structure",
              ]),
            });

            if ((req.user as any)?.roles?.indexOf("linkinq.admin") > -1) {
              return res.json(ret);
            } else {
              return res.json(
                ret.map((r) => {
                  delete r[this.MAIN_ID];
                  return r;
                })
              );
            }
          } catch (e: any) {
            debugger;
            console.error(e);
            //TODO: Stalo by za uvahu nejakym zpusobem chybu omezit aby se neposilala chyba takto detailne
            return apiError({ res, error: e.message || e });
          }
        } else {
          res.sendStatus(401);
        }
      } catch (error: any) {
        console.error("Error fetching data from external API:", error);
        res
          .status(500)
          .send(`Error fetching data from external API: ${error?.message}`);
      }
    });

    //
    // INSERT
    router.post("/entity/:entity", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          const sql = new Sql({
            db: this.db,
            schema: this.schema,
            user: req.user as any,
          });

          const ret = await sql.insert({
            entity: req.params.entity,
            data: req.body,
          });

          if ((req.user as any)?.roles?.indexOf("linkinq.admin") > -1) {
            return res.json(ret);
          } else {
            return res.json(
              ret.map((r) => {
                delete r[this.MAIN_ID];
                return r;
              })
            );
          }
          // return res.json(ret);
        } else {
          res.sendStatus(401);
        }
      } catch (error: any) {
        debugger;
        console.error(
          "Error fetching data from external API:",
          error?.stack || error
        );
        res
          .status(500)
          .send(
            `Error fetching data from external API: ${error?.message || error}`
          );
      }
    });

    // UPDATE
    router.put("/entity/:entity", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          const sql = new Sql({
            db: this.db,
            schema: this.schema,
            user: req.user as any,
          });
          const ret = await sql.update({
            entity: req.params.entity,
            where: req.body.where,
            data: req.body.data,
          });

          return res.json(ret);
        } else {
          res.sendStatus(401);
        }
      } catch (error: any) {
        debugger;
        console.error("Error fetching data from external API:", error?.stack);
        res
          .status(500)
          .send(`Error fetching data from external API: ${error?.message}`);
      }
    });

    // DELETE
    router.delete("/entity/:entity", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          const sql = new Sql({
            db: this.db,
            schema: this.schema,
            user: req.user as any,
          });
          //TODO: pres API dovolit jen mazani pres GUID?
          const ret = await sql.delete({
            entity: req.params.entity,
            where: req.body.where,
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
    });

    router.get("/schema", async (req: Request, res: Response) => {
      // function getFields(obj: any) {
      //   const newObj: any = {};
      //   Object.keys(obj).map((o: any) => {
      //     newObj[o] = obj[o].fields;
      //   });
      //   return newObj;
      // }
      try {
        if (req.user) {
          return res.json(this.schema);
        } else {
          res.sendStatus(401);
        }
      } catch (error: any) {
        debugger;
        console.error("Error fetching data from external API:", error?.stack);
        res.status(500).send("Error fetching data from external API");
      }
    });

    router.post("/entity", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          if (req.body.entity) {
            const entDefinition = addDefaultFields({
              [req.body.entity]: { fields: {} },
            });
            await this.createTables({
              schemaDefinition: entDefinition,
            });

            const x = this.addAttributesToSchema(entDefinition);
            this.setSchema({ ...this.schema, ...x });

            return res.json({});
          }
        } else {
          res.sendStatus(401);
        }
      } catch (error: any) {
        debugger;
        console.error("Error fetching data from external API:", error?.stack);
        res.status(500).send("Error fetching data from external API");
      }
    });

    router.delete("/entity", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          if (req.body.entity) {
            await this.deleteTable({
              tableName: req.body.entity,
            });
            delete this.schema[req.body.entity];

            this.setSchema({ ...this.schema });

            return res.json({});
          }
        } else {
          res.sendStatus(401);
        }
      } catch (error: any) {
        debugger;
        console.error("Error fetching data from external API:", error?.stack);
        res.status(500).send("Error fetching data from external API");
      }
    });

    router.post("/entityField", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          if (
            req.body.entity &&
            req.body.fields &&
            Array.isArray(req.body.fields)
          ) {
            const entityFields = this.schema[req.body.entity].fields;
            for (const f of req.body.fields) {
              ///TODO: ZAAA
              // await this.createField({
              //   tableName: req.body.entity,
              //   columnName: f.name,
              //   columnDef: {
              //     type: f.type,
              //     name: f.name,
              //     description: f.description,
              //   },
              // });
              entityFields[f.name] = f;

              this.setSchema({ ...this.addAttributesToSchema(this.schema) });
            }

            return res.json({});
          }
        } else {
          res.sendStatus(401);
        }
      } catch (error: any) {
        debugger;
        console.error("Error fetching data from external API:", error?.stack);
        res.status(500).send("Error fetching data from external API");
      }
    });

    router.post("/triggers", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          await this.triggers.setTrigger(req.body);
          return res.json({});
        } else {
          res.sendStatus(401);
        }
      } catch (error: any) {
        debugger;
        console.error("Error fetching data from external API:", error?.stack);
        res.status(500).send("Error fetching data from external API");
      }
    });

    //
    router.delete("/triggers", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          await this.triggers.removeTrigger(req.body.guid);
          return res.json({});
        } else {
          res.sendStatus(401);
        }
      } catch (error: any) {
        debugger;
        console.error("Error fetching data from external API:", error?.stack);
        res.status(500).send("Error fetching data from external API");
      }
    });

    router.post(
      "/uploadFile",
      upload.single("file"),
      async (req: Request, res: Response) => {
        if (req.user) {
          const file = (req as any).file;

          const attachments_history: any = await this.db("attachments_history")
            .setUser({ id: 1 })
            .insert({
              caption: file.originalname,
              data: file.buffer,
            });

          const attachments: any = await this.db("attachments")
            .setUser({ id: 1 })
            .insert({
              caption: file.originalname,
              currentversion: attachments_history[0].id,
            });

          console.log("File inserted successfully!");

          return res.json({ guid: attachments[0].guid });
        } else {
          res.sendStatus(401);
        }
      }
    );
    return router;
  }
}
