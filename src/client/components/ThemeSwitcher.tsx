import { DarkThemeToggle } from "flowbite-react";
import { useEffect, useState } from "react";
import { useUserConfigurations } from "../hooks/useUserConfigurations";
import useStore from "../store";

export const ThemeSwitcher = () => {
  const userConfigurations = useStore((state) => state.userConfigurations);
  const profileSettings =
    userConfigurations["profileSettings"]?.definition ?? {};
  const { saveUserConfiguration } = useUserConfigurations();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (profileSettings.theme) {
      document.documentElement.classList.toggle(
        "dark",
        profileSettings.theme === "dark"
      );
      setTheme(profileSettings.theme);
    }
  }, [profileSettings.theme]);

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", newTheme === "dark");
    setTheme(newTheme);

    await saveUserConfiguration("profileSettings", {
      ...profileSettings,
      theme: newTheme,
    });
  };

  return <DarkThemeToggle className="p-1" onClick={toggleTheme} />;
};
