import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import useStore from "./store";
import Login from "./components/Login";
// import Logout from "./components/Logout";
import ProtectedPage from "./components/ProtectedPage";
import PublicPage from "./components/PublicPage";
import { DashboardHeader } from "./components/layout/Header";
import DashboardSidebar from "./components/layout/Sidebar";
import { Flowbite } from "flowbite-react";
import PublicPage2 from "./components/PublicPage2";
import { customTheme } from "./flowbite";
import ServerScript from "./app/ServerScript";
import Journal from "./app/Journal";

interface PrivateRouteProps {
  element: React.FC;
  path: string;
}

const PrivateLayout: React.FC = () => {
  return (
    <Flowbite theme={{ theme: customTheme }}>
      <DashboardHeader />
      <div className="flex items-start pt-10 w-full h-full ">
        <DashboardSidebar />
        <main className="overflow-y-auto relative w-full h-full bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </Flowbite>
  );
};

const PrivateRoute: React.FC = () => {
  const user = useStore((state) => state.user);
  const checkAuth = useStore((state) => state.checkAuth);
  const loading = useStore((state) => state.loading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <PrivateLayout /> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/logout" element={<Logout />} /> */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<PublicPage />} />
          <Route path="/public" element={<PublicPage2 />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/protected" element={<ProtectedPage />} />
          <Route path="/protected2" element={<ProtectedPage />} />
          <Route path="/serverScript" element={<ServerScript />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
