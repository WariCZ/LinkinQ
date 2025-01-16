import { WebApp } from "./webApp";

const webApp = new WebApp();
webApp.initApp();

module.exports = webApp.app;
