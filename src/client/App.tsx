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
import { CustomFlowbiteTheme, Flowbite } from "flowbite-react";
import PublicPage2 from "./components/PublicPage2";

interface PrivateRouteProps {
  element: React.FC;
  path: string;
}

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      primary: "bg-red-500 hover:bg-red-600",
    },
  },
  sidebar: {
    item: {
      base: "py-1 flex items-center justify-center rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
      active: "bg-gray-100 dark:bg-gray-700",
      icon: {
        base: "h-4 w-4 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
        active: "text-gray-700 dark:text-gray-100",
      },
      collapsed: {
        insideCollapse: "group w-full pl-6 transition duration-75",
        noIcon: "font-bold",
      },
    },
    itemGroup: {
      base: "mt-4 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700",
    },
    collapse: {
      button:
        "group flex w-full items-center rounded-lg text-sm font-medium text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
      icon: {
        base: "h-4 w-4 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
        open: {
          off: "",
          on: "text-gray-900",
        },
      },
      label: {
        base: "py-1 ml-3 flex-1 whitespace-nowrap text-left",
        icon: {
          base: "h-4 w-4 transition delay-0 ease-in-out",
          open: {
            on: "rotate-180",
            off: "",
          },
        },
      },
      list: "space-y-1 py-1 bg-gray-100 dark:bg-gray-700",
    },
  },
};

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
          <Route path="/protected" element={<ProtectedPage />} />
          <Route path="/protected2" element={<ProtectedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
