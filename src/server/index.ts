import plugin from "tailwindcss";
import { Linkinq } from "./app";

const linkinq = new Linkinq();
linkinq.initApp();

module.exports = linkinq.app;
