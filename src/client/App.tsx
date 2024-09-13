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
import { DashboardHeader } from "./components/layout/header";
import DashboardSidebar from "./components/layout/sidebar";

interface PrivateRouteProps {
  element: React.FC;
  path: string;
}

const PrivateLayout: React.FC = () => {
  return (
    <>
      <DashboardHeader />
      <div className="flex items-start pt-16 w-full h-full">
        <DashboardSidebar />
        <main className="overflow-y-auto relative w-full h-full bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </>
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
          <Route path="/protected" element={<ProtectedPage />} />
          <Route path="/protected2" element={<ProtectedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
