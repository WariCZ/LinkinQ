// @ts-nocheck
import { Definition, BPMNServer, IModelsDatastore } from "..";

import { ModelsDatastoreDB } from "./ModelsDatastoreDB";

class ModelsDatastore extends ModelsDatastoreDB implements IModelsDatastore {
  modelDefinitions: any;

  constructor(server: BPMNServer, definitions: any) {
    super(server);
    this.modelDefinitions = definitions;
  }
  get definitionsPath() {
    return this.server.configuration.definitionsPath;
  }

  async import(data, owner = null) {
    return await super.import(data);
  }

  async getList(query = null): Promise<string[]> {
    let files = [];
    const fs = require("fs");
    fs.readdirSync(this.definitionsPath).forEach((file) => {
      const path = require("path");
      if (path.extname(file) == ".bpmn") {
        let name = path.basename(file);
        name = name?.substring(0, name.length - 5);

        files.push({ name, saved: null });
      }
    });
    return files;
  }

  /*
   *	loads a definition
   *
   */
  async load(name, owner = null): Promise<Definition> {
    debugger;
    const source = await this.getSource(name);
    //const rules = this.getFile(name, 'rules');

    const definition = new Definition(name, source, this.server);
    await definition.load();
    return definition;
  }

  private getPath(name, type, owner = null) {
    return this.definitionsPath + name + "." + type;
  }

  private getFileFromPath(path, owner = null) {
    const fs = require("fs");
    let file = fs.readFileSync(path, {
      encoding: "utf8",
      flag: "r",
    });
    return file;
  }

  private getFile(name, type, owner = null) {
    const fs = require("fs");
    let file = fs.readFileSync(this.getPath(name, type), {
      encoding: "utf8",
      flag: "r",
    });
    return file;
  }

  private saveFile(name, type, data, owner = null) {
    let fullpath = this.getPath(name, type);
    const fs = require("fs");
    fs.writeFile(fullpath, data, function (err) {
      if (err) throw err;
    });
  }
  async getSource(name, owner = null): Promise<string> {
    debugger;
    return this.getFile(name, "bpmn");
  }
  async getSVG(name, owner = null): Promise<string> {
    return this.getFile(name, "svg");
  }

  async save(name, bpmn, svg?, owner = null): Promise<boolean> {
    this.saveFile(name, "bpmn", bpmn);
    if (svg) this.saveFile(name, "svg", svg);

    await super.save(name, bpmn, svg);

    return true;
  }

  async deleteModel(name: any, owner = null): Promise<void> {
    const fs = require("fs");
    await super.deleteModel(name);
    await fs.unlink(this.definitionsPath + name + ".bpmn", function (err) {
      if (err) console.log("ERROR: " + err);
    });
    await fs.unlink(this.definitionsPath + name + ".svg", function (err) {
      if (err) console.log("ERROR: " + err);
    });
  }
  async renameModel(name: any, newName: any, owner = null): Promise<boolean> {
    const fs = require("fs");
    await super.renameModel(name, newName);
    await fs.rename(
      this.definitionsPath + name + ".bpmn",
      this.definitionsPath + newName + ".bpmn",
      function (err) {
        if (err) console.log("ERROR: " + err);
      }
    );
    await fs.rename(
      this.definitionsPath + name + ".svg",
      this.definitionsPath + newName + ".svg",
      function (err) {
        if (err) console.log("ERROR: " + err);
      }
    );
    return true;
  }
  /**
   *
   * reconstruct the models database from files
   *
   * use when modifying the files manually or importing new environment
   *
   * */
  async rebuild(model = null) {
    try {
      if (model) return this.rebuildModel(model);
      // let filesList = await this.getList();
      let filesList = this.modelDefinitions;

      const models = {};

      // Tady dotahnout vse
      filesList.forEach((f) => {
        models[f.name] = { entry: f.time, name: f.name, path: f.path };
      });
      const dbList = await super.get();
      dbList.forEach((model) => {
        const name = model["name"];
        const saved = new Date(model["saved"]);
        const entry = models[name] && models[name].entry;
        if (entry) {
          if (saved.getTime() > entry.getTime()) {
            delete models[name];
          }
        } else {
          // Nechci to mazat z DB pokud neni na filesystemu
          // super.deleteModel(name);
        }
      });
      let i;

      for (const name in models) {
        const model = models[name];
        await this.rebuildModel(name, model.path);
      }
    } catch (exc) {
      console.log("rebuild error");
      throw exc;
    }
  }
  private async rebuildModel(name, path) {
    console.log("rebuilding " + name);
    let source;
    if (path) {
      source = await this.getFileFromPath(path);
    } else {
      source = await this.getSource(name);
    }
    // idealne nepotrebovat SVG proto je to zakomentovane
    let svg;
    // try {
    //   svg = await this.getSVG(name);
    // } catch (exc) {
    //   //console.log(exc);
    // }
    await super.save(name, source, svg);
  }
}

export { ModelsDatastore };
