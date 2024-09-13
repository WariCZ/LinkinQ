import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
import dotenv from 'dotenv';
import { db } from "../lib/knex";
import entityRoutes from "../lib/entity";
import authRoutes from "../lib/auth";
import { EntitySchema } from "../lib/entity/types";

import {
  checkSchema,
  createEntity,
  deleteEntity,
  createFieldTable,
  createField,
} from "../lib/entity/manageEntities";

dotenv.config();

declare global {
  var prodigi: {
    entityModel: EntitySchema;
  };
}

const schema = checkSchema();
console.log("schema", schema);

const app = express();
const PORT = parseInt(process.env.PORT || "3131",10);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", authRoutes);

app.use("/entity", entityRoutes);

app.get("/protected2", (req: Request, res: Response) => {
  res.json({ message: "This is a protected route", user: req.user });
});

ViteExpress.listen(app, PORT, () => console.log(`Server is listening port ${PORT}...`));
