import fs from "fs";
import { DateTime } from "luxon";
import path from "path";

const getPath = (basePath, filename) => path.join(basePath, filename);

const dynamicImportFromFiles = async (pathFiles) => {
  let importFromFiles = [];

  // Pokud je pathFiles string, převede ho na pole
  const paths = Array.isArray(pathFiles) ? pathFiles : [pathFiles];

  for (const dirPath of paths) {
    debugger;
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      for (const filename of fs.readdirSync(dirPath)) {
        if (path.extname(filename) === ".ts") {
          let name = path.basename(filename);
          const fullPath = getPath(dirPath, name);

          const stats = await fs.promises.stat(fullPath);
          const { default: impFile } = await import(fullPath);

          const impFileTmp = impFile.map((t) => ({
            ...t,
            updatetime: DateTime.fromJSDate(stats.mtime),
          }));

          importFromFiles = importFromFiles.concat(impFileTmp);
        }
      }
    }
  }
  return importFromFiles;
};

export { dynamicImportFromFiles };
