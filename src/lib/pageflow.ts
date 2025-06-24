import express from "express";
import type { NextFunction, Request, Response, Router } from "express";
import authRoutes, { authenticate } from "../lib/auth";
import path from "path";
import fs from "fs";
import { Knex } from "knex";
import _ from "lodash";
import { EntitySchema } from "./entity/types";
import { dbType, Sql } from "./entity/sql";
import { v5 } from "uuid";

import { build } from "esbuild";
import { PageflowType } from "../types/share";
import { extractPageflowFile } from "./utils/extractPageflowFile";
const dirname = __dirname;

export class Pageflow {
  db: dbType;
  dbCore: Knex<any, unknown[]>;
  sqlAdmin: Sql;
  path: string;
  definitions: Record<
    string,
    Record<string, Record<string, Record<string, PageflowType>>>
  > = {};
  schema: EntitySchema = {};

  linkinqLibInstalled = this.isLinkinqInstalled();
  PAGES_PATH = "./client/pages/";
  DNS_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

  constructor({ db }: { db: Knex<any, unknown[]> }) {
    this.db = (table: string) => db(table).setUser({ id: 1 });
    this.dbCore = db;
  }

  get() {
    return this.definitions;
  }

  isLinkinqInstalled() {
    try {
      // require.resolve("@physter/linkinq");
      const res = fs.existsSync(
        path.join(process.cwd(), "node_modules", "@physter/linkinq")
      );
      return res;
      // return true;
    } catch (err) {
      return false;
    }
  }

  getPageflowData = ({ indexFile, fullPath, dir, urlPath }) => {
    const isPublic = fullPath.indexOf("_public") > 0 ? true : false;
    const pageflowFile = extractPageflowFile(indexFile);
    // console.log(key, pageflowFile);

    if (pageflowFile.hasDefaultExport) {
      const rel2 = path.relative(dir.dir, fullPath);
      let rel = rel2.replace(/\\/g, "/");
      rel = rel.endsWith("/") ? rel : rel + "/";

      // result[urlPath + "/" + key] =
      return {
        componentPath: rel,
        source: dir.source,
        urlPath: urlPath, //urlPath + "/" + key,
        isPublic: isPublic,
        ...(pageflowFile.configuration || {}),
      };
    } else {
      if (pageflowFile.configuration) {
        // result[urlPath + "/" + key] =
        return {
          source: dir.source,
          urlPath: urlPath, //urlPath + "/" + key,
          isPublic: isPublic,
          ...(pageflowFile.configuration || {}),
        };
      }
    }
  };

  loadFiles(dir: any) {
    let result: PageflowType = {};

    const filenames =
      process.env.NODE_ENV == "production"
        ? ["index.jsx", "index.tsx"]
        : ["index.tsx"];

    for (const filename of filenames) {
      if (fs.existsSync(path.join(dir.path, filename)) && !dir.urlPath) {
        result[dir.urlPath + "/"] = this.getPageflowData({
          dir,
          fullPath: dir.path,
          indexFile: path.join(dir.path, filename),
          urlPath: dir.urlPath + "/",
        });
      }

      const entries = fs.readdirSync(dir.path, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir.path, entry.name);
        const indexFile = path.join(fullPath, filename);
        const key = entry.name;
        const urlPath = dir.urlPath;

        if (fs.existsSync(indexFile)) {
          result[urlPath + "/" + key] = this.getPageflowData({
            dir,
            fullPath,
            indexFile,
            urlPath: urlPath + "/" + key,
          });
        }

        if (entry.isDirectory()) {
          const children = this.loadFiles({
            path: fullPath,
            source: dir.source,
            dir: dir.dir,
            urlPath: urlPath + "/" + key,
          });

          if (_.keys(children).length > 0) {
            result = { ...result, ...children };
          }
        }
      }
    }
    return result;
  }

  inheritKeys(routes) {
    const keysToInherit = ["sidebar"];
    const parentDataMap = {};
    const updatedRoutes = {};

    const sortedKeys = Object.keys(routes)
      .sort()
      .reduce((acc, key) => {
        acc[key] = routes[key];
        return acc;
      }, {});

    for (const key in sortedKeys) {
      const route = { ...sortedKeys[key] };

      // Ulož si klíče, které daná cesta má — použijeme jako možné rodiče
      const inheritedData = {};
      for (const k of keysToInherit) {
        if (route[k] !== undefined) {
          inheritedData[k] = route[k];
        }
      }
      if (Object.keys(inheritedData).length > 0) {
        parentDataMap[key] = inheritedData;
      }

      // Najdi nejbližšího předka, který má nějaké hodnoty k dědění
      const parentKey = Object.keys(parentDataMap)
        .filter((k) => key.startsWith(k) && k !== key)
        .sort((a, b) => b.length - a.length)[0];

      if (parentKey) {
        for (const k of keysToInherit) {
          if (
            route[k] === undefined &&
            parentDataMap[parentKey][k] !== undefined
          ) {
            route[k] = parentDataMap[parentKey][k];
          }
        }
      }

      updatedRoutes[key] = route;
    }

    return updatedRoutes;
  }

  init = async ({
    schema,
    sqlAdmin,
    modules,
  }: {
    schema: EntitySchema;
    sqlAdmin: Sql;
    modules: any[];
  }) => {
    this.schema = schema;
    this.sqlAdmin = sqlAdmin;

    const folders = [
      {
        source: "Linkinq",
        path: path.join(__dirname, `../`, this.PAGES_PATH),
        dir: path.join(__dirname, `../`),
        urlPath: "",
      },
    ];

    modules?.map((m) => {
      folders.push({
        source: m.moduleName,
        path: path.join(m.modulePath, "../", this.PAGES_PATH),
        dir: path.join(m.modulePath, "../"),
        urlPath: "",
      });
    });

    if (this.linkinqLibInstalled) {
      folders.push({
        source: "App",
        path: path.join(process.cwd(), "/src/", this.PAGES_PATH),
        dir: path.join(process.cwd(), "/src/"),
        urlPath: "",
      });
    }

    let initPageflow = {};
    folders.map((f) => {
      initPageflow = { ...initPageflow, ...this.loadFiles(f) };
    });

    const initPageflowSorted = this.inheritKeys(initPageflow);

    const dbPageflow: any[] = await this.db("pageflow")
      .setUser({ id: 1 })
      .select("*");

    for (const pfKey in initPageflowSorted) {
      const pf = initPageflowSorted[pfKey];

      if (
        Array.isArray(pf.type) &&
        pf.type.includes("detail") &&
        pf.type.includes("popup") &&
        pfKey.indexOf("[guid]") > -1
      ) {
        initPageflowSorted[`${pfKey}`] = {
          ...pf,
          type: "detail",
        };
        initPageflowSorted[`${pfKey.replace("[guid]", "new")}`] = {
          ...pf,
          type: "popup",
          urlPath: pfKey.replace("[guid]", "new"),
          componentPath: pf.componentPath,
        };
      }
    }

    const existsGuids = [];
    for (const pfKey in initPageflowSorted) {
      const pf = initPageflowSorted[pfKey];

      if (Object.keys(pf).length == 0) {
        continue;
      }
      const uuid = v5(pfKey, this.DNS_NAMESPACE);
      const dbPf = _.find(dbPageflow, { guid: uuid });

      const data = {
        kind: 1,
        caption: pf.urlPath,
        componentPath: pf.componentPath,
        source: pf.source,
        isPublic: pf.isPublic,
        to: pf.to,
        noLayout: pf.noLayout,
        sidebar: pf.sidebar,
        entity: pf.entity,
        filter: pf.filter,
        type: pf.type,
        options: pf.options,
      };
      if (dbPf) {
        const t: any[] = await this.db("pageflow")
          .setUser({ id: 1 })
          .where({ guid: uuid })
          .update(data);

        if (t.length > 0) {
          existsGuids.push(uuid);
        }
      } else {
        const t2 = await this.db("pageflow")
          .setUser({ id: 1 })
          .insert({
            ...data,
            guid: uuid,
          });
        existsGuids.push(uuid);
      }
    }
    const x = await this.db("pageflow")
      .setUser({ id: 1 })
      .del()
      .whereNotIn("guid", existsGuids);
  };

  getRoutes(routes) {
    return routes.map((r) => {
      return {
        path: r.caption.replace("/_public", "").replace(/\[(\w+)\]/g, ":$1"),
        componentPath: r.componentPath
          ? r.componentPath.replace("client/", "./")
          : null,
        source: r.source,
        noLayout: r.noLayout,
        to: r.to,
        sidebar: r.sidebar,
        kind: r.kind,
        type: r.type,
        entity: r.entity,
        filter: r.filter,
        options: r.options,
      };
    });
  }
  pageflowRouter(): Router {
    const router: Router = express.Router();

    router.get("/public", async (req: Request, res: Response) => {
      const routes = await this.sqlAdmin.select({
        entity: "pageflow",
        fields: [
          "caption",
          "componentPath",
          "source",
          "noLayout",
          "to",
          "sidebar",
          "entity",
          "filter",
          "kind",
          "type",
          "options",
        ],
        where: {
          isPublic: true,
        },
        orderBy: ["caption-"],
      });

      res.json(this.getRoutes(routes));
    });

    router.get(
      "/complete",
      authenticate,
      async (req: Request, res: Response) => {
        const routes = await this.sqlAdmin.select({
          entity: "pageflow",
          fields: [
            "caption",
            "componentPath",
            "source",
            "noLayout",
            "to",
            "sidebar",
            "entity",
            "filter",
            "kind",
            "type",
            "options",
          ],
          where: {
            "$neq;isPublic": true,
          },
          orderBy: ["caption-"],
        });

        res.json(this.getRoutes(routes));
      }
    );

    router.get(
      "/dynamicComponent",
      authenticate,
      async (req: Request, res: Response) => {
        const code = `
            import React, { useEffect, useState } from "react";
            export default function NewComponent() {
            return <div style={{ color: 'red' }}>Dynamicky vložená komponenta!</div>;
            }
        `;
        const name = "xxx";
        const inputFile = path.join("./dynamicComponent/source", `${name}.tsx`);
        const outFile = path.join("dynamicComponent", "build", `${name}.js`);

        await fs.writeFileSync(inputFile, code);

        await build({
          entryPoints: [inputFile],
          outfile: outFile,
          bundle: true,
          format: "esm",
          platform: "browser",
          jsx: "transform",
          target: ["esnext"],
        });
        res.send({ status: "ok", path: `/dynamic/${name}.js` });
      }
    );

    router.use("/dynamic", express.static("dynamicComponent/build"));

    return router;
  }
}
