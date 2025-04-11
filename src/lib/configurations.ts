import { TriggerItemInternalType } from "../lib/entity/triggers";
import fs from "fs";
import { DateTime } from "luxon";
import path from "path";

const DEFAULT_CONFIGURATION_PATH = "/src/configurations/";
const getPath = (basePath, filename) => path.join(basePath, filename);

// export { dynamicImportFromFiles };

const importFiles = async ({ fullPath, stats, data }) => {
  const { default: impFile } = await import(fullPath);

  const impFileTmp = impFile.map((t) => ({
    ...t,
    updatetime: DateTime.fromJSDate(stats.mtime),
  }));

  return data.concat(impFileTmp);
};

const processesFiles = async ({ fullPath, filename, stats, data }) => {
  let name = path.basename(filename);
  name = name?.substring(0, name.length - 5);

  //
  // const filepath = fullPath + filename + ".bpmn";
  //   var mtime = stats.mtime;
  //   models.set(f["name"], mtime);

  data.push({ name, saved: null, time: stats.mtime, path: fullPath });
  return data;
};

const dynamicImportFromFiles = async (pathFiles, type, cb) => {
  let files = [];
  const completePath = [];
  // Pokud je pathFiles string, převede ho na pole
  const paths = Array.isArray(pathFiles) ? pathFiles : [pathFiles];

  for (const dirPath of paths) {
    if (completePath.indexOf(dirPath) > -1) continue;
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      for (const filename of fs.readdirSync(dirPath)) {
        if (path.extname(filename) === type) {
          let name = path.basename(filename);
          const fullPath = getPath(dirPath, name);

          const stats = fs.statSync(fullPath);

          files = await cb({ fullPath, filename, stats, data: files });
        }
      }
    }
    completePath.push(dirPath);
  }
  return files;
};

const getprocesses = async () => {
  const processesPathLinkinq = path.join(
    __dirname,
    "../../",
    DEFAULT_CONFIGURATION_PATH,
    "/processes/"
  );
  const processesPathApp = path.join(
    process.cwd(),
    DEFAULT_CONFIGURATION_PATH,
    "/processes/"
  );

  const processes: TriggerItemInternalType[] = await dynamicImportFromFiles(
    [processesPathLinkinq, processesPathApp],
    ".bpmn",
    processesFiles
  );

  return processes;
};
// [
//   {
//     name: "Cash Request",
//     saved: null,
//   },
//   {
//     name: "Tasks schema",
//     saved: null,
//   },
// ];
const getTriggers = async () => {
  const triggersPathLinkinq = path.join(
    __dirname,
    "../../",
    DEFAULT_CONFIGURATION_PATH,
    "/triggers/"
  );
  const triggersPathApp = path.join(
    process.cwd(),
    DEFAULT_CONFIGURATION_PATH,
    "/triggers/"
  );
  const triggers: TriggerItemInternalType[] = await dynamicImportFromFiles(
    [triggersPathLinkinq, triggersPathApp],
    ".js",
    importFiles
  );

  return triggers;
};

const loadConfigurations = async () => {
  return {
    processes: await getprocesses(),
    triggers: await getTriggers(),
  };
};

export { loadConfigurations };
