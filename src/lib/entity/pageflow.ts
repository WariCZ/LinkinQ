import express from "express";
import type { NextFunction, Request, Response, Router } from "express";

import pageflow from "../../client/pageflow/configuration";
const pageflowRouter: Router = express.Router();

pageflowRouter.get("/config", (req: Request, res: Response) => {
  //   const pageflow =

  res.json(pageflow);
});

export default pageflowRouter;
