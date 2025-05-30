import express from "express";
import type { NextFunction, Request, Response, Router } from "express";
import authRoutes, { authenticate } from "../lib/auth";
import path from "path";
import fs from "fs";
import { Knex } from "knex";
import _, { update } from "lodash";
import { DateTime } from "luxon";
import EventEmitter from "events";
import { EntitySchema } from "./entity/types";
import { dbType, Sql } from "./entity/sql";
import { MAIN_GUID, MAIN_ID, MAIN_TABLE_ALIAS } from "./knex";
import { hashPassword } from "./entity/utils";

import { build } from "esbuild";
import { Children } from "react";

// export class Pageflow {
//   db: dbType;
//   dbCore: Knex<any, unknown[]>;
//   path: string;
//   definitions: Record<
//     string,
//     Record<string, Record<string, Record<string, pageflowType>>>
//   > = {};
//   eventsOnEntities: EventEmitter;
//   schema: EntitySchema = {};
//   startWorkflow?: ({ table, data }: { table: string; data: any }) => void;
//   constructor({
//     db,
//     eventsOnEntities,
//   }: {
//     db: Knex<any, unknown[]>;
//     eventsOnEntities: EventEmitter;
//   }) {
//     this.eventsOnEntities = eventsOnEntities;
//     this.db = (table: string) => db(table).setUser({ id: 1 });
//     this.dbCore = db;

//     this.registerTriggers(db);
//     this.startWorkflow = undefined;
//   }

//   get() {
//     return this.definitions;
//   }

//     init = async (
//       schema: EntitySchema,
//       initTriggers: TriggerItemInternalType[]
//     ) => {
//       this.schema = schema;

//       const dbTriggers: TriggerItemInternalType[] = await this.db("triggers")
//         .setUser({ id: 1 })
//         .select("*");

//       const registeredGuids = [];
//       // Projdu a pridam vse z DB
//       for (const trigger of dbTriggers) {
//         this.prepareDefinition(trigger);
//         //
//         trigger.code = new Function("return " + trigger.code)();

//         this.definitions[trigger.type][trigger.method][trigger.entity][
//           trigger.guid
//         ] = trigger;

//         registeredGuids.push(trigger.guid);
//       }

//       for (const trigger of initTriggers) {
//         this.prepareDefinition(trigger);
//         const dbTrigger: any =
//           this.definitions[trigger.type][trigger.method][trigger.entity][
//             trigger.guid
//           ];

//         const codeString = trigger.code.toString();
//         if (dbTrigger) {
//           //// trigger uz v DB existuje
//           if (
//             trigger.updatetime.toMillis() >
//             DateTime.fromJSDate(dbTrigger.updatetime).toMillis()
//           ) {
//             await this.db("triggers")
//               .setUser({ id: 1 })
//               .where({ guid: trigger.guid })
//               .update({ ...trigger, code: codeString });
//             this.definitions[trigger.type][trigger.method][trigger.entity][
//               trigger.guid
//             ] = trigger;
//           }
//         } else {
//           // trigger je novy
//           this.definitions[trigger.type][trigger.method][trigger.entity][
//             trigger.guid
//           ] = trigger;
//           await this.db("triggers")
//             .setUser({ id: 1 })
//             .insert({ ...trigger, code: codeString });
//           registeredGuids.push(trigger.guid);
//         }
//       }

//       console.log("this.definitions", this.definitions);
//     };

// }
function prepareRoutes(routes, isPublic) {
  const r = { ...routes };
  if (!isPublic) {
    delete r.public;
  }
  return _.mapValues(r, (route, key) => {
    if (typeof route === "string") {
      route = { componentPath: route };
    }
    return {
      ...route,
      componentPath: route.componentPath
        ? route.componentPath.replace(/\/index\.tsx$/i, "")
        : null,
      path: route.path ? `${route.path}` : `${key}`,
      isPublic: isPublic,
      children: route.children ? prepareRoutes(route.children, isPublic) : null,
    };
  });
}

function pageflowRouter(pageflow: any): Router {
  const router: Router = express.Router();

  //
  router.get("/public", (req: Request, res: Response) => {
    res.json(prepareRoutes(pageflow.public, true));
  });

  router.get("/complete", authenticate, (req: Request, res: Response) => {
    const routes = {
      ...prepareRoutes(pageflow.public, true),
      ...prepareRoutes(pageflow, false),
    };

    res.json(routes);
  });

  router.get(
    "/dynamicComponent",
    authenticate,
    async (req: Request, res: Response) => {
      const code = `
            import React, { useEffect, useState } from "react";
            export default function NewComponent() {
            return <div style={{ color: 'red' }}>Dynamicky vložená komponenta!</div>;
            }
        `;
      const name = "xxx";
      const inputFile = path.join("./dynamicComponent/source", `${name}.tsx`);
      const outFile = path.join("dynamicComponent", "build", `${name}.js`);

      await fs.writeFileSync(inputFile, code);

      await build({
        entryPoints: [inputFile],
        outfile: outFile,
        bundle: true,
        format: "esm",
        platform: "browser",
        jsx: "transform",
        target: ["esnext"],
      });
      res.send({ status: "ok", path: `/dynamic/${name}.js` });
    }
  );

  router.use("/dynamic", express.static("dynamicComponent/build"));

  return router;
}

export default pageflowRouter;
