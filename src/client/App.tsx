import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import useStore from "./store";
import { DashboardHeader } from "./components/layout/Header";
import DashboardSidebar from "./components/layout/Sidebar";
import { Flowbite, Spinner } from "flowbite-react";
import { customTheme } from "./flowbite";
import AppToast from "./components/Toast";
import Pageflow from "./Pageflow";
import { Tasks } from "./app/tasks";
import { Login } from "./app/login";
import { Dashboard } from "./app/dashboard";
import { Profile } from "./app/profile";
import { Adapters } from "./app/admin/adapters";
import { Entity } from "./app/admin/entity";
import { Journal } from "./app/admin/journal";
import { Workflow } from "./app/admin/workflow";
import { ServerScript } from "./app/admin/serverScript";
import { QueryBuilder } from "./app/admin/queryBuilder";
import { Notifications } from "./app/admin/notifications";
import { Triggers } from "./app/admin/triggers";
import { Examples } from "./app/examples";
import { TreeExample } from "./app/examples/TreeExample";
import { useTranslation } from "react-i18next";
import { GroupExample } from "./app/examples/GroupExample";

import { generateRoutes } from "./generateRoutes";
import { DynamicComponent } from "./app/dynamicComponent";

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const user = useStore((state) => state.user);
  const loading = useStore((state) => state.loading);
  const firstLoad = useStore((state) => state.firstLoad);
  const userConfigurations = useStore((state) => state.userConfigurations);
  const pageflow = useStore((state) => state.pageflow);

  useEffect(() => {
    firstLoad();
  }, [firstLoad]);

  useEffect(() => {
    if (!loading) {
      const profileSettings = userConfigurations["profileSettings"]?.definition;
      if (
        profileSettings?.language &&
        i18n.language !== profileSettings.language
      ) {
        i18n.changeLanguage(profileSettings.language);
      }
    }
  }, [loading, userConfigurations, i18n]);

  if (loading) {
    return (
      <div className="flex items-center w-full h-full justify-center">
        <Spinner aria-label="Root loading" size="xl" />
      </div>
    );
  }

  return (
    <Flowbite theme={{ theme: customTheme }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/groupExample" element={<GroupExample />} />
          {generateRoutes(user, pageflow)}

          <Route path="/showdynamicComponent" element={<DynamicComponent />} />
          <Route
            key="not-found"
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Router>
    </Flowbite>
  );
};

export default App;
