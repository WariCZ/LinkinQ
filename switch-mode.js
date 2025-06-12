const fs = require("fs");
const path = require("path");

const mode = process.argv[2]; // "dev" nebo "prod"
const pkgPath = path.join(__dirname, "./package.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

if (mode === "dev") {
  pkg.exports = {
    "./server": "./src/server/index.js",
    "./client": "./src/client/index.jsx",
  };
  pkg.typesVersions = {
    "*": {
      server: ["./src/server/index.ts"],
      client: ["./src/client/index.tsx"],
    },
  };
} else if (mode === "prod") {
  pkg.exports = {
    "./server": "./dist/server/index.js",
    "./client": "./dist/client/index.jsx",
  };
  pkg.typesVersions = {
    "*": {
      server: ["./dist/server/index.d.ts"],
      client: ["./dist/client/index.d.ts"],
    },
  };
} else {
  console.error('Použij "dev" nebo "prod" jako argument');
  process.exit(1);
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log(`✅ ${pkg.name} - Přepnuto na ${mode} režim.`);
