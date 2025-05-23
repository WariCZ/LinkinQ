import { TriggerItemInternalType } from "./entity/triggers";
import fs from "fs";
import { DateTime } from "luxon";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { EntitySchema } from "./entity/types";
import _ from "lodash";
import { createRequire } from "module";
const filename = __filename;
const dirname = __dirname;
// const filename = fileURLToPath(import.meta.url);
// const dirname = path.dirname(filename);

const DEFAULT_CONFIGURATION_PATH = "/configurations/";
const CONFIGURATION_PATH_LINKINQ = path.join(
  dirname,
  "../",
  DEFAULT_CONFIGURATION_PATH
);
const CONFIGURATION_PATH_APP = path.join(
  process.cwd(),
  process.env.NODE_ENV == "production" ? "dist/" : "src/",
  DEFAULT_CONFIGURATION_PATH
);

console.log("CONFIGURATION_PATH_LINKINQ", CONFIGURATION_PATH_LINKINQ);
console.log("CONFIGURATION_PATH_APP", CONFIGURATION_PATH_APP);

const getPath = (basePath, filename) => path.join(basePath, filename);

export const triggerFiles = async ({ fullPath, stats, data, key }) => {
  if (!key) key = "default";
  if (!data) data = [];
  // const { [key]: impFile } = await import(pathToFileURL(fullPath).href);

  let impFile = require(fullPath.replace("file:///", ""))[key];
  const impFileTmp = impFile.map((t) => ({
    ...t,
    updatetime: DateTime.fromJSDate(stats.mtime),
  }));

  return data.concat(impFileTmp);
};

export const importFiles = async ({ fullPath, stats, data, key }) => {
  if (!key) key = "default";

  let impFile;
  // if (typeof require !== "undefined" && require.main) {
  // CommonJS - načti přes require
  impFile = require(fullPath.replace("file:///", ""))[key];
  // } else {
  //   // ESM - načti přes dynamický import
  //   const filepath = pathToFileURL(fullPath).href;
  //   impFile = await import(filepath);
  //   impFile = { [key]: impFile };
  //   console.log("import impFile", impFile);
  // }

  // const filepath = pathToFileURL(fullPath).href;
  // let { [key]: impFile } = await import(filepath);
  if (typeof impFile == "function") {
    impFile = impFile({ env: process.env });
    console.log("impFile", impFile);
  }
  data = _.mergeWith(data, impFile, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
  return data;
};

const processFiles = async ({ fullPath, filename, stats, data }) => {
  if (!data) data = [];
  let name = path.basename(filename);
  name = name?.substring(0, name.length - 5);

  data.push({ name, saved: null, time: stats.mtime, path: fullPath });
  return data;
};

export const dynamicImportFromFiles = async (
  pathFiles,
  typesFiles,
  cb,
  key?: string
) => {
  let files;
  const completePath = [];
  // Pokud je pathFiles string, převede ho na pole
  const paths = Array.isArray(pathFiles) ? pathFiles : [pathFiles];
  const types = Array.isArray(typesFiles) ? typesFiles : [typesFiles];

  for (const dirPath of paths) {
    if (completePath.indexOf(dirPath) > -1) continue;
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      for (const filename of fs.readdirSync(dirPath)) {
        console.log("filename", filename);
        const ext = path.extname(filename);
        if (types.includes(ext) && !filename.endsWith(".d.ts")) {
          let name = path.basename(filename);
          const fullPath = getPath(dirPath, name);

          const stats = fs.statSync(fullPath);
          files = await cb({ fullPath, filename, stats, data: files, key });
        }
      }
    }
    completePath.push(dirPath);
  }
  return files;
};

const getprocesses = async () => {
  const folder = "/processes/";

  const processes: TriggerItemInternalType[] = await dynamicImportFromFiles(
    [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    ".bpmn",
    processFiles
  );

  return processes;
};

const getTriggers = async () => {
  const folder = "/triggers/";

  const triggers: TriggerItemInternalType[] = await dynamicImportFromFiles(
    [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    [".js", ".ts"],
    triggerFiles
  );

  return triggers;
};

const getEntities = async () => {
  const folder = "/entities/";
  const entities: any = await dynamicImportFromFiles(
    [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    [".js", ".ts"],
    importFiles
  );
  return entities;
};

const getDefaultData = async () => {
  const folder = "/data/";
  const defaultData: any = await dynamicImportFromFiles(
    [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    [".js", ".ts"],
    importFiles
  );
  return defaultData;
};

const getUpdateData = async () => {
  const folder = "/data/";
  const defaultData: any = await dynamicImportFromFiles(
    [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    [".js", ".ts"],
    importFiles,
    "updateData"
  );
  return defaultData;
};

const getPageflow = async () => {
  const folder = "/pageflow/";
  const defaultData: any = await dynamicImportFromFiles(
    [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    [".js", ".ts"],
    importFiles
  );
  return defaultData;
};

const loadConfigurations = async () => {
  return {
    updateData: await getUpdateData(),
    defaultData: await getDefaultData(),
    entities: await getEntities(),
    processes: await getprocesses(),
    triggers: await getTriggers(),
    pageflow: await getPageflow(),

    // updateData: {},
    // defaultData: {},
    // entities: {},
    // processes: [],
    // triggers: [],
  };
};

export { loadConfigurations };
