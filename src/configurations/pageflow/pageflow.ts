import { PageflowType } from "../../types/share";

const routesConfig: PageflowType = {
  public: {
    login: { componentPath: "../client/pages/login/", noLayout: true },
    "/": {
      to: "/login",
    },
  },
  "/": {
    //  component: "Dashboard"
    componentPath: "../client/pages/dashboard/",
  },
  admin: {
    sidebar: "admin",
    children: {
      "": {
        to: "/admin/journal",
      },
      journal: "../client/pages/admin/journal/",
      workflow: "../client/pages/admin/workflow/",
      serverScript: "../client/pages/admin/serverScript/",
      entity: "../client/pages/admin/entity/",
      triggers: "../client/pages/admin/triggers/",
      querybuilder: "../client/pages/admin/querybuilder/",
      notifications: "../client/pages/admin/notifications/",
      adapters: "../client/pages/adapters/",
    },
  },
  test: "../client/pages/test/",
};

export default routesConfig;
