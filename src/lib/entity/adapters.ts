import { Knex } from "knex";
import express from "express";
import type { NextFunction, Request, Response, Router } from "express";
import EventEmitter from "events";
import { dbType, Sql } from "./sql";
// import { sendEmail } from "./adaptersDef/mail";
import _, { before } from "lodash";
import { EntitySchema } from "./types";
import { CallActivity } from "bpmn-server";

export class Adapters {
  db: Knex<any, unknown[]>;
  eventsOnEntities: EventEmitter;
  adapters: Record<string, any>;
  schema: EntitySchema;
  sqlAdmin: Sql;

  constructor({
    db,
    eventsOnEntities,
  }: {
    db: Knex<any, unknown[]>;
    eventsOnEntities: EventEmitter;
  }) {
    this.eventsOnEntities = eventsOnEntities;
    this.db = db;
    this.adapters = {};
    this.sqlAdmin;

    this.eventsOnEntities.on("afterTrigger", (msg) => {
      const data = { ...msg.before, ...msg.beforeData };
      this.findNotifications({
        data,
        entity: msg.entity,
        method: msg.method,
      });
    });
  }

  getNames = () => {
    return _.keys(this.adapters);
  };

  registerAdapter = ({ adapter }: { adapter: any }) => {
    this.adapters[adapter.name] = { class: adapter, instances: [] };
  };

  createInstanceAdapter = async ({ data }: { data: any }) => {
    if (this.adapters[data.type]) {
      const existAdapter = await this.sqlAdmin.select({
        entity: "adapters",
        fields: ["guid"],
        where: {
          guid: data.guid,
        },
      });

      if (existAdapter && existAdapter[0].guid) {
        await this.sqlAdmin.update({
          entity: "adapters",
          where: {
            guid: existAdapter[0].guid,
          },
          data: data,
        });
      } else {
        await this.sqlAdmin.insert({
          entity: "adapters",
          data: data,
        });

        const adapters = this.adapters[data.type];
        adapters.instances.push(data);
      }
    } else {
      throw `Adapter ${data.type} not registed`;
    }
  };

  loadAdapters = async (schema: EntitySchema) => {
    this.schema = schema;
    this.sqlAdmin = new Sql({
      db: this.db,
      schema: this.schema,
      user: { id: 1 } as any,
    });

    var adapters = await this.db("adapters").setUser({ id: 1 }).select("*");
    ////
    for (const adapter of adapters) {
      if (this.adapters[adapter.type]) {
        if (adapter.active) {
          const classInstance = new this.adapters[adapter.type].class({
            db: this.db,
            schema: this.schema,
          });
          classInstance.init(adapter.settings, (ret) => {
            if (ret) {
              this.sqlAdmin.update({
                entity: "adapters",
                data: {
                  status: true,
                },
                where: { guid: adapter.guid },
              });
              this.adapters[adapter.type].instances.push(classInstance);
            }
          });
        } else {
          console.log(`Adapter ${adapter.caption} is not active`);
        }
      } else {
        console.error(
          `Adapter type '${adapter.type}' not exists instance not loaded `
        );
      }
    }
  };

  setAdapter = async ({ caption, type, settings, active }) => {
    if (this.adapters[type]) {
      if (active) {
        const classInstance = new this.adapters[type].class({
          db: this.db,
          schema: this.schema,
        });
        classInstance.init(settings);
        this.adapters[type].instances.push(classInstance);
      }

      await this.db("adapters").insert({
        active,
        caption,
        type,
        settings,
      });
    } else {
      throw `Adapter type '${type}' not exists`;
    }
  };

  findNotifications = async (props) => {
    this.adapters["mailAdapter"].instances.map((instance) => {
      instance.send(props);
    });
  };

  configRoutes = (): Router => {
    const router = express.Router();

    router.get("/adaptersType", async (req: Request, res: Response) => {
      const ads = {};
      _.keys(this.adapters).map((key) => {
        ads[key] = {
          type: key,
          form: this.adapters[key].class.form,
        };
      });
      res.json(ads);
    });

    router.post("/setAdapterActive", async (req: Request, res: Response) => {});

    router.post("/setAdapter", async (req: Request, res: Response) => {
      console.log(req.body);
      debugger;
      try {
        let data = { ...req.body };
        delete data.adapterType;
        // if (this.adapters[req.body.adapterType]) {
        // data = {
        //   caption: "muj prvni",
        //   type: "mailAdapter",
        //   active: true,
        //   settings: {
        //     host: "mail.physter.lan",
        //     port: 25,
        //     ignoreCertificates: false,
        //   },
        // };

        this.createInstanceAdapter({ data });
        res.json({});
      } catch (e) {
        debugger;
        console.error(e);
      }
    });

    return router;
  };
}
