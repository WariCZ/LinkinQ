import { Knex } from "knex";
import EventEmitter from "events";
import { EntitySchema } from "./types";
import { dbType, Sql } from "./sql";
// import { sendEmail } from "./adaptersDef/mail";
import _, { before } from "lodash";
import { Settings } from "luxon";

export class Adapters {
  db: dbType;
  eventsOnEntities: EventEmitter;
  adapters: Record<string, any>;

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

    this.eventsOnEntities.on("afterTrigger", (msg) => {
      console.log("message for ", msg);
      //   if (msg.entity == "tasks") {
      //     const data = { ...msg.before, ...msg.beforeData };
      //     this.findNotifications({
      //       data,
      //       entity: msg.entity,
      //       method: msg.method,
      //     });
      //   }
    });
  }

  getNames = () => {
    return _.keys(this.adapters);
  };

  registerAdapter = ({ adapter }: { adapter: any }) => {
    this.adapters[adapter.name] = { class: adapter, instances: [] };
  };

  loadAdapters = async () => {
    // var adapters = await this.db("adapters").select("*").where({
    //     active: true
    // });
    [
      {
        caption: "muj prvni",
        type: "mailAdapter",
        settings: {
          host: "mail.physter.lan",
          port: 25,
          ignoreCertificates: false,
        },
      },
    ].map((adapter) => {
      if (this.adapters[adapter.type]) {
        const classInstance = new this.adapters[adapter.type].class();
        classInstance.init(adapter.settings);
        this.adapters[adapter.type].instances.push(classInstance);
      } else {
        console.error(
          `Adapter type '${adapter.type}' not exists instance not loaded `
        );
      }
    });
  };

  setAdapter = async ({ caption, type, settings, active }) => {
    if (this.adapters[type]) {
      if (active) {
        const classInstance = new this.adapters[type].class();
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

  findNotifications = async ({ data, entity, method }) => {
    // const ntfs = await this.db("notifications")
    //   .select("filter,adapters")
    //   .where({
    //     entity,
    //     active: true,
    //     method,
    //   });
    debugger;

    this.adapters["mailAdapter"].instances.map((instance) => {
      debugger;
      instance.send();
    });
    // for (const ntf of ntfs) {
    //   debugger;
    // }
  };

  //   notifyUser = async () => {
  //     const userEmail = "jakub.vareka@gmail.com";
  //     const subject = "Notifikace";
  //     const message = "Toto je vaše notifikace!";

  //     await sendEmail(userEmail, subject, message);
  //   };
}
