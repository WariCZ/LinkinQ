// @ts-nocheck
import {
  Definition,
  BPMNServer,
  IBpmnModelData,
  IModelsDatastore,
  IEventData,
  ServerComponent,
  QueryTranslator,
} from "..";

import { db, prepareConditions } from "../../knex";
import { BpmnModelData } from "./ModelsData";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";
// import { Definition } from "../elements";
// import { BPMNServer } from "../server";

// import { ServerComponent } from "../server/ServerComponent";
// import { IBpmnModelData, IModelsDatastore, IEventData } from "../interfaces/";

// import { QueryTranslator } from "./QueryTranslator";

const Definition_collection = "wf_models";
const Events_collection = "wf_events";

class ModelsDatastoreDB extends ServerComponent implements IModelsDatastore {
  db;

  constructor(server: BPMNServer) {
    super(server);
    this.db = db();
  }

  async get(query = {}): Promise<object[]> {
    const list = await this.db(Definition_collection)
      .setUser({ id: 1 })
      .where(query)
      .select("*");
    return list;
  }

  async getList(query = {}): Promise<string[]> {
    const records = await this.db(Definition_collection)
      .setUser({ id: 1 })
      .where(query)
      .select("name");

    const list = records.map((r) => ({ name: r.name }));
    return list;
  }
  /*
   *	Load a definition
   */
  async load(name: string, owner = null): Promise<Definition> {
    console.log("loading ", name, "from db");
    const data = await this.loadModel(name);
    const definition = new Definition(name, data.source, this.server);
    await definition.load();
    return definition;
  }

  async getSource(name: string, owner = null): Promise<string> {
    debugger;
    const model = await this.loadModel(name);
    return model.source;
  }

  async getSVG(name: string, owner = null): Promise<string> {
    const model = await this.loadModel(name);
    return model.svg;
  }

  /*
   * Load a definition data record from DB
   */
  async loadModel(name: string, owner = null): Promise<BpmnModelData> {
    const records = await this.db(Definition_collection)
      .setUser({ id: 1 })
      .where({ name: name })
      .select("*");

    this.logger.log(`find model for ${name} recs: ${records.length}`);
    return records[0];
  }

  async save(name: string, source: any, svg: any, owner = null): Promise<any> {
    let bpmnModelData = new BpmnModelData(name, source, svg, null, null);
    const definition = new Definition(
      bpmnModelData.name,
      bpmnModelData.source,
      this.server
    );

    try {
      await definition.load();
      bpmnModelData.parse(definition);

      await this.saveModel(bpmnModelData, owner);
      return bpmnModelData;
    } catch (exc) {
      console.log("error in save", exc?.stack || exc);
      throw exc;
    }
  }

  async findEvents(query, owner = null): Promise<IEventData[]> {
    const events = [];
    let trans;
    let newQuery = query;

    if (query) {
      trans = new QueryTranslator("events");
      newQuery = trans.translateCriteria(query);

      const { conditions, values } = prepareConditions(query);

      newQuery = this.db.raw(
        conditions.join(" AND ").setUser({ id: 1 }),
        values
      );
    }

    const records = await this.db(Events_collection)
      .setUser({ id: 1 })
      .where(newQuery)
      .select("*");

    records.forEach((rec) => {
      rec.events.forEach((ev) => {
        let pass = true;
        if (query) {
          pass = trans.filterItem(ev, newQuery);
        }
        if (pass) {
          ev.modelName = rec.name;
          ev._id = rec._id;
          events.push(ev);
        }
      });
    });

    return events;
  }

  async install() {
    debugger;
    // Use Knex to create indexes or tables if necessary
    await this.db.schema
      .setUser({ id: 1 })
      .createTableIfNotExists(Definition_collection, (table) => {
        table.string("name").unique();
        table.json("source");
        table.json("svg");
        table.timestamps(true, true);
      });

    this.logger.log("Database installation complete.");
  }

  async import(data: Object, owner = null) {
    debugger;
    return await this.db(Definition_collection).setUser({ id: 1 }).insert(data);
  }

  async updateTimer(name: string, owner = null): Promise<boolean> {
    const source = await this.getSource(name, owner);
    let model = new BpmnModelData(name, source, null, null, null);
    let definition = new Definition(model.name, model.source, this.server);

    await definition.load();
    model.parse(definition);

    await this.db(Definition_collection)
      .setUser({ id: 1 })
      .where({ name: model.name })
      .update({ events: model.events });

    this.logger.log("updating model");
    return true;
  }

  async saveModel(model: IBpmnModelData, owner = null): Promise<boolean> {
    //
    model.saved = new Date();
    const existingRecord = await this.db(Definition_collection)
      .setUser({ id: 1 })
      .where({ name: model.name })
      .first();

    const parser = new XMLParser({
      ignoreAttributes: false, // důležité pro čtení atributů!
      attributeNamePrefix: "@_",
      allowBooleanAttributes: true,
      ignoreDeclaration: false,
      parseAttributeValue: true,
    });

    const parsed = parser.parse(model.source);

    const process =
      (parsed["bpmn:definitions"] &&
        parsed["bpmn:definitions"]["bpmn:process"]) ||
      (parsed["bpmn2:definitions"] &&
        parsed["bpmn2:definitions"]["bpmn2:process"]);

    const entity = process["@_linkinq:entity"];
    const filter =
      process["@_linkinq:filter"] && JSON.parse(process["@_linkinq:filter"]);
    //
    if (existingRecord) {
      await this.db(Definition_collection)
        .setUser({ id: 1 })
        .where({ name: model.name })
        .update({
          name: model.name,
          owner: owner,
          saved: model.saved,
          source: model.source,
          svg: model.svg,
          processes: JSON.stringify(model.processes),
          events: JSON.stringify(model.events),
          filter: filter,
          entity: entity,
        });
    } else {
      await this.db(Definition_collection)
        .setUser({ id: 1 })
        .insert({
          name: model.name,
          owner: owner,
          saved: model.saved,
          source: model.source,
          svg: model.svg,
          processes: JSON.stringify(model.processes),
          events: JSON.stringify(model.events),
          filter: filter,
          entity: entity,
        });
    }

    return true;
  }

  async deleteModel(name: string, owner = null) {
    await this.db(Definition_collection)
      .setUser({ id: 1 })
      .where({ name: name })
      .del();
  }

  async renameModel(name: string, newName: string, owner = null) {
    await this.db(Definition_collection)
      .setUser({ id: 1 })
      .where({ name: name })
      .update({ name: newName });

    this.logger.log("Model renamed successfully.");
    return true;
  }

  async export(name: string, folderPath: string, owner = null) {
    const model = await this.loadModel(name, owner);

    fs.writeFile(`${folderPath}/${name}.bpmn`, model.source, (err: any) => {
      if (err) throw err;
      console.log(`Saved BPMN to ${folderPath}/${name}.bpmn`);
    });

    fs.writeFile(`${folderPath}/${name}.svg`, model.svg, (err: any) => {
      if (err) throw err;
      console.log(`Saved SVG to ${folderPath}/${name}.svg`);
    });
  }

  async rebuild(model = null) {
    // Implement the rebuild logic if needed
  }
}

export { ModelsDatastoreDB };
