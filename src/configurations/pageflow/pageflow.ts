import { Login } from "../../client/app/login";
import { RoutesConfig } from "../../client/generateRoutes";

const routesConfig = {
  login: {
    path: "/login",
    component: "Login",
    public: true,
  },
  main: {
    layoutProps: {},
    children: {
      // "/": { component: Dashboard },
      // profile: { component: Profile },
      // tasks: { component: Tasks },
      // TestPageFlow: { component: TestPageFlow },
    },
  },
  // admin: {
  //   path: "/admin",
  //   layoutProps: { admin: true },
  //   children: {
  //     journal: { component: Journal },
  //   },
  // },
};

export default routesConfig;
