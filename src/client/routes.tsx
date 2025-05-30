import React, { lazy, useEffect } from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import { DashboardHeader } from "./components/layout/Header";
import DashboardSidebar from "./components/layout/Sidebar";
import AppToast from "./components/Toast";
import { User } from "../lib/auth";
import { PageflowRecordClient } from "../types/share";

export type RouteEntry = {
  path?: string; // např. "/login" nebo "/admin"
  component?: string; // React komponenta
  public?: boolean; // veřejná route bez ochrany
  layoutProps?: Record<string, any>; // props pro PrivateRoute (např. admin: true)
  children?: Record<string, RouteEntry>; // zanořené routy (např. "profile", "entity/:id")
};

export type RoutesConfig = Record<string, RouteEntry>;

const PrivateLayout = (props: {
  sidebar?: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <DashboardHeader />
      <div className="flex items-start pt-10 w-full h-full ">
        <DashboardSidebar {...props} />
        <main className="overflow-y-auto relative w-full h-full bg-gray-50 dark:bg-gray-900">
          {props.children}
        </main>
      </div>
      <AppToast />
    </>
  );
};

const getComponent = ({ componentPath, pages }) => {
  let cPath;
  if (componentPath.indexOf("../client") > -1) {
    cPath = componentPath.replace("../client", ".");
  } else {
    cPath = componentPath;
  }

  const Component = lazy(async () => {
    const loader = pages[cPath]; // path musí být klíč z objektu výše
    if (!loader) throw new Error(`Path "${cPath}" not found in glob.`);
    const module = await loader();
    return { default: module.default };
  });

  return Component;
};

function generateRoutes({
  user,
  pageflow,
  sidebar,
}: {
  user: User;
  pageflow: PageflowRecordClient;
  sidebar?: string;
}): React.ReactNode[] {
  const routes: React.ReactNode[] = [];

  // @ts-expect-error – TypeScript to neumí, ale Vite ano
  const pagesImport = import.meta.glob("./pages/**/index.{jsx,tsx}");

  const pages = Object.fromEntries(
    Object.entries(pagesImport).map(([key, value]) => {
      // Odstranit /index.tsx
      const newKey = key.replace(/index\.tsx$/i, "");
      return [newKey, value];
    })
  );

  for (const [key, pf] of Object.entries(pageflow)) {
    const { path, componentPath, noLayout, children, to } = pf;

    if (to) {
      routes.push(
        <Route key={path} path={path} element={<Navigate to={to} replace />} />
      );
    } else if (children) {
      const layoutPath = path || "";
      routes.push(
        <Route key={layoutPath} path={layoutPath}>
          {generateRoutes({ user, pageflow: children, sidebar: pf.sidebar })}
        </Route>
      );
    } else {
      const Component = getComponent({ componentPath, pages });
      if (noLayout) {
        routes.push(<Route key={path} path={path} element={<Component />} />);
      } else {
        routes.push(
          <Route
            key={path}
            path={path}
            element={
              <PrivateLayout sidebar={sidebar}>
                <Component />
              </PrivateLayout>
            }
          />
        );
      }
    }
  }

  return routes;
}

export { generateRoutes };
