import React, { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import useStore from "./store";
import { Flowbite, Spinner } from "flowbite-react";
import { customTheme } from "./flowbite";

import { useTranslation } from "react-i18next";

import { generateRoutes } from "./routes";

const App = ({ pages }: any) => {
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
        <Suspense
          fallback={
            <div className="flex items-center w-full h-full justify-center">
              <Spinner aria-label="Root loading" size="xl" />
            </div>
          }
        >
          <Routes>
            {generateRoutes({ user, pageflow: pageflow, pages })}
            <Route
              key="not-found"
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </Suspense>
      </Router>
    </Flowbite>
  );
};

export default App;
