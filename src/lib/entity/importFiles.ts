import fs from "fs";
import { DateTime } from "luxon";

const getPath = (path, name) => {
  return path + name;
};

const dynamicImportFromFiles = async (path) => {
  let ImportFromFiles = [];
  if (path) {
    for (const filename of fs.readdirSync(path)) {
      const path = require("path");
      if (path.extname(filename) == ".ts") {
        let name = path.basename(filename);

        const stats = await fs.promises.stat(getPath(path, name));
        const { default: impFile } = await import(getPath(path, name));

        const impFileTmp = impFile.map((t) => ({
          ...t,
          updatetime: DateTime.fromJSDate(stats.mtime),
        }));

        ImportFromFiles = ImportFromFiles.concat(impFileTmp);
      }
    }
  }
  return ImportFromFiles;
};

export { dynamicImportFromFiles };
