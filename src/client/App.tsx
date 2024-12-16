import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import useStore from "./store";
import Login from "./pages/Login";

import PublicPage from "./pages/PublicPage";
import { DashboardHeader } from "./components/layout/Header";
import DashboardSidebar from "./components/layout/Sidebar";
import { Flowbite, Toast } from "flowbite-react";
import { customTheme } from "./flowbite";
import ServerScript from "./pages/admin/ServerScript";
import Journal from "./pages/admin/Journal";
import Workflow from "./pages/admin/Workflow";
import Entity from "./pages/admin/Entity";
import Tasks from "./pages/Tasks";
import Triggers from "./pages/admin/Triggers";
import AppToast from "./components/Toast";
import Profile from "./pages/Profile";
import QueryBuilder from "./pages/admin/QueryBuilder";

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

const PrivateRoute = (props: { admin?: boolean }) => {
  const user = useStore((state) => state.user);
  const checkAuth = useStore((state) => state.checkAuth);
  const loading = useStore((state) => state.loading);
  const getSchema = useStore((state) => state.getSchema);
  const firstLoad = useStore((state) => state.firstLoad);

  useEffect(() => {
    firstLoad();
  }, [firstLoad]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <PrivateLayout {...props} /> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Flowbite theme={{ theme: customTheme }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<PublicPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="tasks" element={<Tasks />} />
          </Route>
          {/* <Route path="/logout" element={<Logout />} /> */}
          <Route path="/admin/" element={<PrivateRoute admin={true} />}>
            <Route path="" element={<Entity />} />
            <Route path="journal" element={<Journal />} />
            <Route path="workflow" element={<Workflow />} />
            <Route path="serverScript" element={<ServerScript />} />
            <Route path="entity" element={<Entity />} />
            <Route path="triggers" element={<Triggers />} />
            <Route path="querybuilder" element={<QueryBuilder />} />
            {/* <Route path="*" element={<Navigate to="" replace />} /> */}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Flowbite>
  );
};

export default App;
