// @ts-nocheck

import {
  DataHandler,
  Execution,
  IDataStore,
  IBPMNServer,
  IInstanceData,
  IItemData,
  ServerComponent,
  //   InstanceLocker,
  QueryTranslator,
} from "..";

// import { DataHandler } from "../engine";
// import { Execution } from "../engine/Execution";
// import {
//   IDataStore,
//   IBPMNServer,
//   IInstanceData,
//   IItemData,
// } from "../interfaces";
// import { ServerComponent } from "../server/ServerComponent";
import { InstanceLocker } from ".";
// import { QueryTranslator } from "./QueryTranslator";

import { db, prepareConditions } from "../../knex";

export const Instance_collection = "wf_instances";
export const Locks_collection = "wf_locks";
export const Archive_collection = "wf_archives";

class DataStore extends ServerComponent implements IDataStore {
  dbConfiguration;
  db;

  execution: Execution;
  isModified = false;
  isRunning = false;
  inSaving = false;
  promises = [];
  locker;
  enableSavePoints = false;

  constructor(server: IBPMNServer) {
    super(server);
    this.db = db();
    this.locker = new InstanceLocker(this);
  }

  async save(instance, options = {}) {
    return await this.saveInstance(instance);
  }

  async loadInstance(instanceId, options = {}) {
    const recs = await this.findInstances({ guid: instanceId }, "full");
    if (recs.length == 0) {
      this.logger.error("Instance is not found for this item");
      return null;
    }
    const instanceData = recs[0];
    return {
      instance: instanceData,
      items: this.getItemsFromInstances([instanceData]),
    };
  }

  private getItemsFromInstances(instances, condition = null, trans = null) {
    const items = [];
    instances.forEach((instance) => {
      instance.items.forEach((i) => {
        let pass = true;

        // TODO: neni implementovano ELSE
        pass = i.id == condition.bindings[0];
        //if (trans) pass = trans.filterItem(i, condition);

        if (pass) {
          let data;
          if (instance.tokens[i.tokenId]) {
            let dp = instance.tokens[i.tokenId].dataPath;
            if (dp !== "") data = DataHandler.getData(instance.data, dp);
            else data = instance.data;
          } else data = instance.data;

          i["processName"] = instance.name;
          i["data"] = data;
          i["instanceId"] = instance.id;
          i["instanceVersion"] = instance.version;
          items.push(i);
        }
      });
    });
    return items.sort((a, b) => a.seq - b.seq);
  }

  static seq = 0;
  private async saveInstance(instance, options = {}) {
    let saveObject = {
      version: instance.version,
      endedAt: instance.endedAt,
      status: instance.status,
      saved: instance.saved,
      tokens: JSON.stringify(instance.tokens),
      items: JSON.stringify(instance.items),
      loops: JSON.stringify(instance.loops),
      logs: JSON.stringify(instance.logs),
      data: JSON.stringify(instance.data),
      parentItemId: instance.parentItemId,
    };

    if (instance.version == null) instance.version = 0;
    else instance.version++;

    if (this.enableSavePoints) {
      let lastItem = instance.items[instance.items.length - 1].id;
      let savePoint = {
        guid: lastItem,
        items: JSON.stringify(instance.items),
        loop: JSON.stringify(instance.loops),
        tokens: JSON.stringify(instance.tokens),
        data: JSON.stringify(instance.data),
      };

      if (!instance["savePoints"]) instance["savePoints"] = {};
      instance["savePoints"][lastItem] = savePoint;

      saveObject["savePoints"] = instance["savePoints"];
    }

    if (!instance.saved) {
      instance.saved = new Date();

      instance.guid = instance.id;
      delete instance.id;

      const insertInstance = { ...instance };
      insertInstance.items = JSON.stringify(instance.items);
      insertInstance.loops = JSON.stringify(instance.loops);
      insertInstance.tokens = JSON.stringify(instance.tokens);
      insertInstance.logs = JSON.stringify(instance.logs);
      insertInstance.data = JSON.stringify(instance.data);
      insertInstance.savePoints = JSON.stringify(instance.savePoints);

      const ic = await this.db(Instance_collection)
        .setUser({ id: 1 })
        .insert(insertInstance);
      instance.id = insertInstance.guid;
      instance.dbId = ic[0].id;
    } else {
      // saveObject.items = JSON.stringify(saveObject.items);
      // saveObject.loops = JSON.stringify(saveObject.loops);
      // saveObject.tokens = JSON.stringify(saveObject.tokens);
      // saveObject.logs = JSON.stringify(saveObject.logs);
      // saveObject.data = JSON.stringify(saveObject.data);
      // saveObject.savePoints = JSON.stringify(saveObject.savePoints);

      const ret = await this.db(Instance_collection)
        .setUser({ id: 1 })
        // .where({ id: instance.dbId })
        .where({ guid: instance.guid })
        .update(saveObject);

      if (ret.length == 0) {
        throw "..DataStore: no update instance collection";
      }
    }

    this.logger.log("..DataStore: saving Complete");
  }

  async findItem(query): Promise<IItemData> {
    let results = await this.findItems(query);
    if (results.length == 0)
      throw Error("No items found for " + JSON.stringify(query));
    else if (results.length > 1)
      throw Error(
        "More than one record found " + results.length + JSON.stringify(query)
      );
    else return results[0];
  }

  async findInstance(query, options): Promise<IInstanceData> {
    let results = await this.findInstances(query, options);
    if (results.length == 0)
      throw Error("No instance found for " + JSON.stringify(query));
    else if (results.length > 1)
      throw Error(
        "More than one record found " + results.length + JSON.stringify(query)
      );

    return results[0];
  }

  async findInstances(
    query,
    option: "summary" | "full" | any = "summary"
  ): Promise<IInstanceData[]> {
    let projection = null;
    let sort = null;

    if (option == "summary") projection = ["source", "logs"];
    else if (option["projection"]) projection = option["projection"];
    if (option["sort"]) sort = option["sort"];

    const { conditions, values } = prepareConditions(query);

    const records = await this.db(Instance_collection)
      .setUser({ id: 1 })
      .select(projection || "*")
      .whereRaw(conditions.join(" AND "), values);
    //   .orderBy(sort); TODO: Translate to knex
    return records;
  }

  async findItems(query): Promise<IItemData[]> {
    const trans = new QueryTranslator("items");
    // const y = trans.translateCriteria(query);
    const { conditions, values } = prepareConditions(query);

    const result = this.db
      .raw(conditions.join(" AND "), values)
      .setUser({ id: 1 });
    const projection = [
      "guid",
      "id",
      "data",
      "name",
      "version",
      "items",
      "tokens",
    ];
    const records = await this.db(Instance_collection)
      .setUser({ id: 1 })
      .select(projection)
      .where(result);
    const items = this.getItemsFromInstances(records, result, trans);
    return items;
  }

  async deleteInstances(query) {
    await this.db(Instance_collection).setUser({ id: 1 }).where(query).del();
  }

  async install() {
    debugger;
    return;
    await this.db.schema
      .setUser({ id: 1 })
      .createTableIfNotExists(Instance_collection, (table) => {
        table.increments("id").primary();
        table.json("items");
        table.json("tokens");
        table.string("status");
        table.timestamps(true, true);
      });

    await this.db.schema
      .setUser({ id: 1 })
      .createTableIfNotExists(Locks_collection, (table) => {
        table.increments("id").primary();
      });
  }

  async archive(query) {
    debugger;
    let docs = await db(Instance_collection)
      .setUser({ id: 1 })
      .where(query)
      .select();
    if (docs.length > 0) {
      await db(Archive_collection).setUser({ id: 1 }).insert(docs);
      await this.deleteInstances(query);
    }

    console.log("total of ", docs.length, " archived");
  }
}

export { DataStore };
