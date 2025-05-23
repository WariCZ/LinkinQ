import express from "express";
import type { NextFunction, Request, Response, Router } from "express";
import authRoutes, { authenticate } from "../../lib/auth";
import path from "path";
import fs from "fs";

import { build } from "esbuild";

function pageflowRouter(pageflow: string): Router {
  const router: Router = express.Router();

  router.get("/config", (req: Request, res: Response) => {
    //   const pageflow =

    res.json(pageflow);
  });

  router.get(
    "/dynamicComponent",
    authenticate,
    async (req: Request, res: Response) => {
      const code = `
            export default function NewComponent() {
            return <div style={{ color: 'red' }}>Dynamicky vložená komponenta!</div>;
            }
        `;
      const name = "xxx";
      const inputFile = path.join("./tmp", `${name}.tsx`);
      const outFile = path.join("public", "dynamic", `${name}.js`);

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

  router.use("/dynamic", express.static("public/dynamic"));

  return router;
}

export default pageflowRouter;
