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
      username: "test",
      userGroups: ["SYSTEM"],
      qualifyInstances: (query) => query,
      qualifyItems: (query) => query,
    };
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

    router.post("/invoke", async (req: Request, res: Response) => {
      try {
        if (req.user) {
          console.log("bpmnAPI");
          //
          // let id = req.query.id;
          // let processName = req.query.processName;
          // let elementId = req.query.elementId;
          let id = "94d0b91f-99ca-4230-8779-c9041eb38aa8";
          let processName = "Cash Request";
          let elementId = "Activity_03i6maz";

          const instances = await this.bpmnAPI.data.findInstances(
            { "items.id": id },
            this.getSecureUser(req.user) as any,
            "full"
          );

          const instance = instances[0];

          let { node, fields } = await this.getNodeInfo(
            this.bpmnServer,
            processName,
            elementId
          );

          if (fields && fields.length > 0) {
            debugger;
            //TODO: workflow.ts
          } else {
            let result = await this.bpmnAPI.engine.invoke(
              { "items.id": id },
              {},
              this.getSecureUser(req.user) as any
            );
          }
          debugger;
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
