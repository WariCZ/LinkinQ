import { TriggerItemInternalType } from "./entity/triggers";
import fs from "fs";
import { DateTime } from "luxon";
import path from "path";
import _ from "lodash";
const dirname = __dirname;

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

const getPath = (basePath, filename) => path.join(basePath, filename);

export const triggerFiles = async ({ fullPath, stats, data, key }) => {
  if (!key) key = "default";
  if (!data) data = [];

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

  impFile = require(fullPath.replace("file:///", ""))[key];

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

const getprocesses = async (pathFiles) => {
  const folder = "/processes/";

  const processes: TriggerItemInternalType[] = await dynamicImportFromFiles(
    pathFiles || [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    ".bpmn",
    processFiles
  );

  return processes;
};

const getTriggers = async (pathFiles) => {
  const folder = "/triggers/";

  const triggers: TriggerItemInternalType[] = await dynamicImportFromFiles(
    pathFiles || [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    [".js", ".ts"],
    triggerFiles
  );

  return triggers;
};

const getEntity = async (pathFiles) => {
  const folder = "/entity/";
  const entity: any = await dynamicImportFromFiles(
    pathFiles || [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    [".js", ".ts"],
    importFiles
  );
  return entity;
};

const getDefaultData = async (pathFiles) => {
  const folder = "/data/";
  const defaultData: any = await dynamicImportFromFiles(
    pathFiles || [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    [".js", ".ts"],
    importFiles
  );
  return defaultData;
};

const getUpdateData = async (pathFiles) => {
  const folder = "/data/";
  const defaultData: any = await dynamicImportFromFiles(
    pathFiles || [
      path.join(CONFIGURATION_PATH_LINKINQ, folder),
      path.join(CONFIGURATION_PATH_APP, folder),
    ],
    [".js", ".ts"],
    importFiles,
    "updateData"
  );
  return defaultData;
};

const loadConfigurations = async (pathFiles?: string) => {
  return {
    updateData: await getUpdateData(pathFiles),
    defaultData: await getDefaultData(pathFiles),
    entity: await getEntity(pathFiles),
    processes: await getprocesses(pathFiles),
    triggers: await getTriggers(pathFiles),
  };
};

export { loadConfigurations };
