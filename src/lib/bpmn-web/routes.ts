import { BPMNAPI, BPMNServer, Behaviour_names } from "bpmn-server";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import _ from "lodash";
import { Sql } from "../entity/sql";
import { EntitySchema } from "../entity/types";
import { Knex } from "knex";

export class BpmnRoutes {
  bpmnAPI: BPMNAPI;
  sqlAdmin: Sql;
  bpmnServer: BPMNServer;
  schema: EntitySchema;
  db: Knex;
  constructor({
    bpmnAPI,
    sqlAdmin,
    bpmnServer,
    schema,
    db,
  }: {
    bpmnAPI: BPMNAPI;
    sqlAdmin: Sql;
    bpmnServer: BPMNServer;
    schema: EntitySchema;
    db: Knex;
  }) {
    this.bpmnAPI = bpmnAPI;
    this.sqlAdmin = sqlAdmin;
    this.bpmnServer = bpmnServer;
    this.schema = schema;
    this.db = db;
  }

  getSecureUser(user) {
    return {
      username: "system",
      userGroups: ["SYSTEM"],
      qualifyInstances: (query) => query,
      qualifyItems: (query) => query,
    };
  }
  async getInstanceByItemId(id, user) {
    const instances = await this.bpmnAPI.data.findInstances(
      { "items.id": id },
      this.getSecureUser(user) as any,
      "full"
    );

    const instance = instances[0];
    let processName = instance.name;
    let elementId = _.find(instance.items, { id }).elementId;

    return { instance, processName, elementId, itemId: id };
  }

  async getNodeInfo(bpmnServer, processName, elementId) {
    let definition = await bpmnServer.definitions.load(processName);
    let node = definition.getNodeById(elementId);
    let extName = Behaviour_names.CamundaFormData;
    let ext;
    if (node) ext = node.getBehaviour(extName);
    let fields;
    if (ext) fields = ext.fields;
    return { node, fields };
  }

  config() {
    const router = express.Router();

    router.post("/invokeHaveFields", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          let id = req.body.id;

          const { processName, elementId } = await this.getInstanceByItemId(
            id,
            req.user
          );

          let x = await this.getNodeInfo(
            this.bpmnServer,
            processName,
            elementId
          );

          let { node, fields } = await this.getNodeInfo(
            this.bpmnServer,
            processName,
            elementId
          );

          const flows = node.outbounds.map((flow) => {
            return {
              name: flow.name,
              value: flow?.def?.conditionExpression?.body?.replace(
                /\$\(item.data.move=="(.*)"\)/,
                "$1"
              ),
            };
          });

          return res.json({ flows, fields });
        }
      } catch (error) {
        console.error("Error fetching data from external API:", error);
        res.status(500).send("Error fetching data from external API");
      }
    });

    router.post("/invoke", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          console.log("bpmnAPI");
          //
          let id = req.body.id;

          const { instance, processName, elementId } =
            await this.getInstanceByItemId(id, req.user);

          let { node, fields } = await this.getNodeInfo(
            this.bpmnServer,
            processName,
            elementId
          );
          let result;
          if (fields && fields.length > 0) {
            result = await this.bpmnAPI.engine.invoke(
              { "items.id": id },
              req.body.itemFields,
              this.getSecureUser(req.user) as any
            );

            //TODO: workflow.ts
          } else {
            result = await this.bpmnAPI.engine.invoke(
              { "items.id": id },
              {},
              this.getSecureUser(req.user) as any
            );
          }

          if (
            result?.item?.node?.def?.$attrs &&
            _.keys(result.item.node.def.$attrs).length > 0
          ) {
            const sql = new Sql({
              schema: this.schema,
              db: this.db,
              user: req.user as any,
            });
            const entityData = {};
            _.keys(result.item.node.def.$attrs).forEach((attr) => {
              if (attr.indexOf("linkinq:") > -1) {
                if (result.item.node.def.$attrs[attr] === "$user") {
                  entityData[attr.replace("linkinq:", "")] = (
                    req.user as any
                  ).guid;
                } else {
                  entityData[attr.replace("linkinq:", "")] =
                    result.item.node.def.$attrs[attr];
                }
              }
            });

            if (_.keys(entityData).length > 0) {
              if (node.process.def.$attrs["linkinq:entity"]) {
                const entity: string =
                  node.process.def.$attrs["linkinq:entity"];

                const x = await sql.update({
                  entity,
                  where: { "workflowInstance.id": instance.id },
                  data: entityData,
                });
                console.log("x");
              } else {
                throw "Error worflow cannot defined entity";
              }
            }
          }

          return res.json({});
        } else {
          res.sendStatus(401);
        }
      } catch (error) {
        console.error("Error fetching data from external API:", error);
        res.status(500).send("Error fetching data from external API");
      }
    });

    return router;
  }
}
