import express from "express";
import type { NextFunction, Request, Response } from "express";
import { getData, getQueries } from "./methodsDB";

import axios from "axios";
import passport from "passport";
import { apiError } from "../logger";
import _ from "lodash";
import { Entity } from ".";
import { EntitySchema } from "./types";

export class EntityRoutes extends Entity {
  schema: EntitySchema = {};

  async initSchema() {
    this.schema = await this.prepareSchema();
  }

  getSchema() {
    return this.schema;
  }
  setSchema(schema: EntitySchema) {
    return (this.schema = schema);
  }

  config() {
    const router = express.Router();

    router.get(
      "/:entity",
      passport.authenticate("basic", { session: false }),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            var entity = req.params.entity;
            if (entity) {
              if (this.schema[entity]) {
                try {
                  debugger;
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
      "/:entity",
      passport.authenticate("basic", { session: false }),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            var entity = req.params.entity;
            if (entity) {
              if (this.schema[entity]) {
                const body = req.body;
                // Update
                if (body.guid) {
                  const data = { ...body, updatedby: req.user.id };

                  const updatedRows = await this.db(entity)
                    .where({ guid: body.guid })
                    .update(data)
                    .returning(this.MAIN_ID);

                  return res.json(updatedRows);
                } else {
                  //Insert
                  const data = {
                    ...body,
                    createdby: req.user?.id,
                    updatedby: req.user?.id,
                  };

                  if (body.workflow) {
                    const res = await fetch(
                      process.env.BPMN_SERVER_URL +
                        "/api/engine/start/" +
                        body.workflow,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "x-api-key": process.env.BPMN_SERVER_KEY,
                        } as any,
                      }
                    ).then((response) => response.json());

                    data.workflowInstance = res.id;
                  }

                  const insertedRows = await this.db(entity)
                    .insert(data)
                    .returning(this.MAIN_ID);

                  return res.json(insertedRows);
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
          debugger;
          console.error("Error fetching data from external API:", error);
          res.status(500).send("Error fetching data from external API");
        }
      }
    );

    router.delete(
      "/:entity",
      passport.authenticate("basic", { session: false }),
      async (req: Request, res: Response) => {
        try {
          if (req.user) {
            var entity = req.params.entity;
            if (entity) {
              if (this.schema[entity]) {
                const body = req.body;
                if (body.guid) {
                  const deletedRows = await this.db(entity)
                    .where({ guid: body.guid })
                    .del()
                    .returning(this.MAIN_ID);

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

    // router.delete(
    //   "/:entity",
    //   passport.authenticate("basic", { session: false }),
    //   async (req: Request, res: Response) => {
    //   var entity = context.params.entity;
    //   const body = await req.json();
    //   const token = await getToken({ req, secret });

    //   console.log("TOKEN", token);
    //   if (entity) {
    //     // Update
    //     if (body.guid) {
    //       const data = { ...body, updatedby: token?.id };

    //       const deletedRows = await db(entity)
    //         .where({ guid: body.guid })
    //         .del()
    //         .returning(MAIN_ID);

    //       return Response.json(deletedRows);
    //     } else {
    //       return apiError({ error: `Guid is mandatory` });
    //     }
    //     // const data = {
    //     //   entity,
    //     //   ids: [insertedRows[0].id],
    //     //   operation: "CREATE",
    //     //   uuid: uuidv1(),
    //     // };
    //     // emitSSEMessage(data);

    //     // const res = await fetch('https://data.mongodb-api.com/...', {
    //     //   method: 'POST',
    //     //   headers: {
    //     //     'Content-Type': 'application/json',
    //     //     'API-Key': process.env.DATA_API_KEY,
    //     //   },
    //     //   body: JSON.stringify({ time: new Date().toISOString() }),
    //     // })
    //   } else {
    //     return apiError({ error: `Entity not found` });
    //   }
    // }

    return router;
  }
}
