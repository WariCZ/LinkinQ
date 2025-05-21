import React from "react";
import { useTranslation } from "react-i18next";
import useStore from "../../../../src/client/store";
import { useUserConfigurations } from "../../../../src/client/hooks/useUserConfigurations";
import { Button } from "flowbite-react";
import { AppSelect } from "../../../../src/client/components/common/AppSelect";

const dateFormatOptions = [
  { value: "dd.MM.yyyy", label: "dd.MM.yyyy" },
  { value: "MM/dd/yyyy", label: "MM/dd/yyyy" },
  { value: "yyyy-MM-dd", label: "yyyy-MM-dd" },
  { value: "dd/MM/yyyy", label: "dd/MM/yyyy" },
  { value: "yyyy.MM.dd", label: "yyyy.MM.dd" },
  { value: "dd.MM.yyyy HH:mm", label: "dd.MM.yyyy HH:mm" },
  { value: "MM/dd/yyyy HH:mm", label: "MM/dd/yyyy HH:mm" },
];

export const Profile = () => {
  const { i18n } = useTranslation();
  const userConfigurations = useStore((state) => state.userConfigurations);
  const profileSettings =
    userConfigurations["profileSettings"]?.definition ?? {};
  const { saveUserConfiguration } = useUserConfigurations();

  const changeLanguage = async (language: string) => {
    if (profileSettings.language !== language) {
      i18n.changeLanguage(language);
      await saveUserConfiguration("profileSettings", {
        ...profileSettings,
        language,
      });
    }
  };

  const changeDateFormat = async (format: string) => {
    if (profileSettings.dateFormat !== format) {
      await saveUserConfiguration("profileSettings", {
        ...profileSettings,
        dateFormat: format,
      });
    }
  };

  return (
    <div className="flex justify-start items-start p-4 h-full">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Profile Settings
          </h1>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">
                Language
              </label>
              <div className="flex gap-3">
                {["en", "cs"].map((lang) => (
                  <Button
                    key={lang}
                    color={
                      profileSettings.language === lang ? "cyan" : "alternative"
                    }
                    onClick={() => changeLanguage(lang)}
                    size="sm"
                    className="w-28"
                  >
                    {lang === "en" ? "English" : "Čeština"}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">
                Date Format
              </label>
              <AppSelect
                id="date-format"
                value={profileSettings.dateFormat}
                options={dateFormatOptions.map((opt) => ({
                  label: opt.label || opt.value,
                  value: opt.value,
                }))}
                placeholder="Select date format"
                onChange={(value) => changeDateFormat(value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
