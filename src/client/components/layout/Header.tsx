import useStore from "../../store";
// import { useSidebarContext } from "@/context/SidebarContext";
// import { isSmallScreen } from "@/helpers/is-small-screen";
// import Search from "../search/search";
import {
  Avatar,
  Dropdown,
  Navbar,
} from "flowbite-react";
// import { useSession, signOut } from "next-auth/react";
// import Image from "next/image";
// import Link from "next/link";
// import useLocalStorage from "../../lib/useLocalStorage";
import { HiMenuAlt1, HiX } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
// import { sidebarContext } from "../sidebarProvider";
// import NotificationButton from "../notifications/notificationButton";

import logo from "../../static/logo.png";
import { useTranslation } from "react-i18next";
import { ThemeSwitcher } from "../ThemeSwitcher";
// const logo = require("../../static/logo.png");

const isSmallScreen = () => {
  return false;
};

const getUserInitials = function (user: string) {
  const words = user.split(" ");
  const firstWord = words[0];
  const lastWord = words[words.length - 1];

  const Initials =
    firstWord == lastWord
      ? firstWord.charAt(0)
      : firstWord.charAt(0) + lastWord.charAt(0);
  return Initials.toUpperCase();
};

const UserAvatar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const goTo = (to: string) => {
    navigate(to);
  };

  if (!user) return null;
  return (
    <Dropdown
      className="w-40"
      label={
        <Avatar
          size="sm"
          placeholderInitials={
            user?.fullname ? getUserInitials(user.fullname) : ""
          }
          rounded
        />
      }
      arrowIcon={false}
      inline
    >
      <Dropdown.Header>
        <span className="block text-sm font-bold">{user.fullname}</span>
      </Dropdown.Header>
      <Dropdown.Item
        onClick={() => {
          goTo("/profile");
        }}
      >
        {t("header.profile")}
      </Dropdown.Item>
      {/* <Dropdown.Item>{t("header.settings")}</Dropdown.Item> */}
      <Dropdown.Item
        onClick={() => {
          goTo("/admin");
        }}
      >
        {t("header.administration")}
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={() => logout()}>
        {t("header.signout")}
      </Dropdown.Item>
    </Dropdown>
  );
};

export const DashboardHeader = function (props: { admin?: boolean }) {
  const { t } = useTranslation();

  const sidebar = useStore((state) => state.sidebar);
  const setSidebar = useStore((state) => state.setSidebar);

  return (
    <header>
      <Navbar
        fluid
        className="fixed top-0 z-30 w-full border-b border-gray-200 bg-white p-0 dark:border-gray-700 dark:bg-gray-800 sm:p-0"
      >
        <div className="w-full p-0 pr-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                aria-controls="sidebar"
                aria-expanded
                className="mr-2 cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:bg-gray-700 dark:focus:ring-gray-700"
                onClick={() => {
                  setSidebar(!sidebar);
                }}
              >
                {!isSmallScreen() ? (
                  <HiMenuAlt1 className="h-6 w-6" />
                ) : (
                  <HiX className="h-6 w-6" />
                )}
              </button>
              <div className="hidden md:block">
                <Navbar.Brand as="span">
                  <Link to="/">
                    <img alt="Linkinq" src={logo} style={{ height: "25px" }} />
                  </Link>
                  {props.admin ? (
                    <span className="font-bold px-2 mt-0 text-2xl">
                      {t("header.administration")}
                    </span>
                  ) : null}
                </Navbar.Brand>
              </div>

              <div className=" mx-16 w-400">{/* <Search /> */}</div>
            </div>

            <div className="flex gap-5">
              {/* <NotificationButton /> */}
              <ThemeSwitcher />
              <div>
                <UserAvatar />
              </div>
            </div>
          </div>
        </div>
      </Navbar>
    </header>
  );
};
