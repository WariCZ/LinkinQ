import { BPMNAPI, BPMNServer, Behaviour_names } from "bpmn-server";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import _ from "lodash";
import { Sql } from "../entity/sql";

export class BpmnRoutes {
  bpmnAPI: BPMNAPI;
  sqlAdmin: Sql;
  bpmnServer: BPMNServer;
  constructor(bpmnAPI: BPMNAPI, sqlAdmin: Sql, bpmnServer: BPMNServer) {
    this.bpmnAPI = bpmnAPI;
    this.sqlAdmin = sqlAdmin;
    this.bpmnServer = bpmnServer;
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
    //

    // router.post("/getNodeInfo", async (req: Request, res: Response) => {
    //   try {
    //     if (req.user) {
    //       let id = req.body.id;

    //       const { processName, elementId } = await this.getInstanceByItemId(
    //         id,
    //         req.user
    //       );

    //       let { node, fields } = await this.getNodeInfo(
    //         this.bpmnServer,
    //         processName,
    //         elementId
    //       );

    //     let definition = await this.bpmnServer.definitions.load(processName);
    //     let node = definition.getNodeById(elementId);
    //     let extName = Behaviour_names.CamundaFormData;
    //     let ext;
    //     if (node)
    //         ext = node.getBehaviour(extName);
    //     let fields;
    //     if (ext)
    //         fields = ext.fields;
    //     return { node, fields };

    //       return res.json({ fields });
    //     }
    //   } catch (error) {
    //     console.error("Error fetching data from external API:", error);
    //     res.status(500).send("Error fetching data from external API");
    //   }
    // });

    router.post("/invokeHaveFields", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          let id = req.body.id;

          const { processName, elementId } = await this.getInstanceByItemId(
            id,
            req.user
          );

          let { node, fields } = await this.getNodeInfo(
            this.bpmnServer,
            processName,
            elementId
          );

          return res.json({ fields });
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

          const { processName, elementId } = await this.getInstanceByItemId(
            id,
            req.user
          );

          let { node, fields } = await this.getNodeInfo(
            this.bpmnServer,
            processName,
            elementId
          );

          if (fields && fields.length > 0) {
            let result = await this.bpmnAPI.engine.invoke(
              { "items.id": id },
              req.body.itemFields,
              this.getSecureUser(req.user) as any
            );

            //TODO: workflow.ts
          } else {
            let result = await this.bpmnAPI.engine.invoke(
              { "items.id": id },
              {},
              this.getSecureUser(req.user) as any
            );

            return res.json({});
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
