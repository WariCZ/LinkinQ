import React, { useEffect } from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import { Spinner } from "flowbite-react";
import { useTranslation } from "react-i18next";
import useStore from "./store";
import { DashboardHeader } from "./components/layout/Header";
import DashboardSidebar from "./components/layout/Sidebar";
import AppToast from "./components/Toast";

export type RouteEntry = {
  path?: string; // např. "/login" nebo "/admin"
  component?: string; // React komponenta
  public?: boolean; // veřejná route bez ochrany
  layoutProps?: Record<string, any>; // props pro PrivateRoute (např. admin: true)
  children?: Record<string, RouteEntry>; // zanořené routy (např. "profile", "entity/:id")
};

export type RoutesConfig = Record<string, RouteEntry>;

const PrivateLayout = (props: { admin?: boolean }) => {
  return (
    <>
      <DashboardHeader {...props} />
      <div className="flex items-start pt-10 w-full h-full ">
        <DashboardSidebar {...props} />
        <main className="overflow-y-auto relative w-full h-full bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
      <AppToast />
    </>
  );
};

const PrivateRoute = (props: { admin?: boolean }, user: any) => {
  return user ? <PrivateLayout {...props} /> : <Navigate to="/login" />;
};

export function generateRoutes(user, config): React.ReactNode[] {
  const routes: React.ReactNode[] = [];

  for (const [key, value] of Object.entries(config)) {
    const {
      path,
      component: Component,
      public: isPublic,
      children,
      layoutProps,
    } = value as any;

    if (isPublic) {
      routes.push(<Route key={path} path={path} element={<Component />} />);
    } else if (children) {
      // Children grouped under PrivateRoute (with or without admin prop)
      const layoutPath = value.path || "";
      routes.push(
        <Route
          key={layoutPath}
          path={layoutPath}
          element={<PrivateRoute {...(layoutProps || {})} user={user} />}
        >
          {Object.entries(children).map(([childPath, childConfig]: any) => {
            const ChildComponent = childConfig.component;
            return (
              <Route
                key={childPath}
                path={childPath}
                element={<ChildComponent />}
              />
            );
          })}
        </Route>
      );
    }
  }

  // Catch-all
  //   routes.push(
  //     <Route key="not-found" path="*" element={<Navigate to="/" replace />} />
  //   );

  return routes;
}
