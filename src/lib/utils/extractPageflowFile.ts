const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * Načte TSX soubor a extrahuje `configuration` a info o default exportu
 * @param {string} filePath - cesta k souboru (např. ./src/components/Adapters.tsx)
 * @returns {{ configuration: object|null, hasDefaultExport: boolean }}
 */

export function extractPageflowFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  let configurationValue = null;
  let hasDefaultExport = false;

  traverse(ast, {
    ExportNamedDeclaration(path) {
      const decl = path.node.declaration;
      if (decl?.type === "VariableDeclaration") {
        for (const d of decl.declarations) {
          if (d.id.name === "configuration") {
            const init = d.init;
            const raw = code.slice(init.start, init.end);
            try {
              configurationValue = eval("(" + raw + ")");
            } catch (err) {
              console.warn(
                "⚠️ Eval selhal při parsování configuration:",
                err.message
              );
              configurationValue = null;
            }
          }
        }
      }
    },
    ExportDefaultDeclaration() {
      hasDefaultExport = true;
    },
  });

  return {
    configuration: configurationValue,
    hasDefaultExport,
  };
}
