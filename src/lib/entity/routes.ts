import express from "express";
import type { NextFunction, Request, Response } from "express";
import { getData, getQueries } from "./methodsDB";

import passport from "passport";
import { apiError } from "../logger";
import _ from "lodash";
import { Entity } from ".";
import { authenticateWithMultipleStrategies } from "../auth";

export class EntityRoutes extends Entity {
  validateEntityBody({ body }: { body: any }) {
    if (Array.isArray(body)) {
      return "Array is not supported";
    }

    return;
  }

  config() {
    const router = express.Router();

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
      // passport.authenticate("basic", { session: false }),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            var entity = req.params.entity;
            if (entity) {
              if (this.schema[entity]) {
                try {
                  // res.json({
                  //   message: "This is a protected route sdawdwa",
                  //   user: req.user,
                  //   entity: req.params.entity,
                  //   query: req.query,
                  // });
                  const fields = (req.query.__fields + ",guid" ||
                    "*") as string;

                  // console.log("fieldsArr", fields.split(","));
                  // console.log(
                  //   "where",
                  //   _.omit(req.query as any, ["entity", "__fields"])
                  // );
                  const queries = getQueries({
                    schema: this.schema,
                    entity,
                    fieldsArr: fields.split(","),
                    where: _.omit(req.query as any, ["entity", "__fields"]),
                  });
                  // console.log("queries", queries);
                  const data = await getData({
                    ...queries,
                    schema: this.schema,
                  });

                  // console.log("data", data);
                  return res.json(data);
                } catch (e: any) {
                  console.error(e);
                  //TODO: Stalo by za uvahu nejakym zpusobem chybu omezit aby se neposilala chyba takto detailne
                  return apiError({ res, error: e.message });
                }
              } else {
                apiError({ res, error: `Entity ${entity} not exists` });
              }
            } else {
              apiError({ res, error: `Entity not found` });
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

    router.post(
      "/entity/:entity",
      authenticateWithMultipleStrategies(["local", "basic"]),
      // passport.authenticate("basic", { session: false }),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            const entity = req.params.entity;
            if (entity) {
              if (this.schema[entity]) {
                const body = req.body;

                const errMsg = this.validateEntityBody({ body });
                if (!errMsg) {
                  // Update
                  if (body.guid) {
                    const updatedRows = await this.db(entity)
                      .setUser(req.user)
                      .where({ guid: body.guid })
                      .update(body)
                      .returning(this.MAIN_ID);

                    return res.json(updatedRows);
                  } else {
                    //
                    //Insert

                    // if (body.workflow) {
                    //   const res = await fetch(
                    //     process.env.BPMN_SERVER_URL +
                    //       "/api/engine/start/" +
                    //       body.workflow,
                    //     {
                    //       method: "POST",
                    //       headers: {
                    //         "Content-Type": "application/json",
                    //         "x-api-key": process.env.BPMN_SERVER_KEY,
                    //       } as any,
                    //     }
                    //   ).then((response) => response.json());

                    //   data.workflowInstance = res.id;
                    // }
                    const insertedRows = await this.db(entity)
                      .setUser(req.user)
                      .insert(body);

                    return res.json(insertedRows);
                  }
                } else {
                  apiError({ res, error: errMsg });
                }
              } else {
                apiError({ res, error: `Entity ${entity} not exists` });
              }
            } else {
              apiError({ res, error: `Entity not found` });
            }
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

    router.delete(
      "/entity/:entity",
      authenticateWithMultipleStrategies(["local", "basic"]),
      // passport.authenticate("basic", { session: false }),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            var entity = req.params.entity;
            if (entity) {
              if (this.schema[entity]) {
                const body = req.body;
                if (body.guid) {
                  const deletedRows = await this.db(entity)
                    .setUser(req.user)
                    .where({ guid: body.guid })
                    .del()
                    .returning(this.MAIN_ID);
                  // .asUser(req.user);

                  return res.json(deletedRows);
                } else {
                  return apiError({ res, error: `Guid is mandatory` });
                }
              } else {
                apiError({ res, error: `Entity ${entity} not exists` });
              }
            } else {
              apiError({ res, error: `Entity not found` });
            }
          } else {
            res.sendStatus(401);
          }
        } catch (error: any) {
          debugger;
          console.error(
            "Error fetching data from external API:",
            error?.message
          );
          res.status(500).send("Error fetching data from external API");
        }
      }
    );

    return router;
  }
}
