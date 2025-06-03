import { PageflowType } from "../../types/share";

const routesConfig: PageflowType = {
  "/_public/": {
    to: "/login",
  },
  "/_public/login": {
    noLayout: true,
  },
  "/_public/testpublic": {
    noLayout: true,
  },
  "/": {
    to: "/dashboard",
  },
  "/admin": {
    to: "/admin/journal",
    sidebar: "admin",
  },
};

export default routesConfig;
