"use client";
import { useState, useEffect, useContext } from "react";
// import useLocalStorage from "../../lib/useLocalStorage";
import { Sidebar } from "flowbite-react";
import { IoMdHome } from "react-icons/io";

import { FaBuffer } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { FaProjectDiagram } from "react-icons/fa";
import { FaTable } from "react-icons/fa";
import { FaDatabase } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaHubspot } from "react-icons/fa";
import useStore from "@/client/store";
import logo from "../../static/logo.png";
import { FaCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { FaMailBulk } from "react-icons/fa";
import { FaSitemap } from "react-icons/fa";
import { FaRegFileAlt } from "react-icons/fa";

type Label = {
  label: string;
  icon?: React.FC;
};

type WithTo = Label & {
  to: string; // Povinný atribut 'to', pokud je přítomen
  children?: never; // Pokud je 'to', nesmí být 'children'
  filter?: Record<string, any>;
};

type WithChildren = Label & {
  children: MenuItemType[]; // Povinný atribut 'children', pokud je přítomen
  to?: never; // Pokud jsou 'children', nesmí být 'to'
};
type MenuItemType = WithTo | WithChildren;

export default function DashboardSidebar(props: { admin?: boolean }) {
  const { t } = useTranslation();
  const sidebar = useStore((state) => state.sidebar);
  const setSidebar = useStore((state) => state.setSidebar);
  const navigate = useNavigate();

  const goTo = (data: WithTo) => {
    navigate(data.to, {
      state: { header: data.label, filter: data.filter },
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 800) {
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const menuAdmin: MenuItemType[] = [
    {
      label: "Journal",
      to: "/admin/journal",
      icon: FaBuffer,
    },
    {
      label: "Workflows",
      to: "/admin/workflow",
      icon: FaProjectDiagram,
    },
    {
      label: "Server side script",
      to: "/admin/serverScript",
      icon: FaCode,
    },
    {
      label: "Entity",
      to: "/admin/entity",
      icon: FaDatabase,
    },
    {
      label: "Triggers",
      to: "/admin/triggers",
      icon: FaHubspot,
    },
    {
      label: "Query builder",
      to: "/admin/querybuilder",
      icon: FaTable,
    },
    {
      label: "Adapters",
      to: "/admin/adapters",
      icon: FaSitemap,
    },
    {
      label: "Notifications",
      to: "/admin/notifications",
      icon: FaMailBulk,
    },
  ];

  const menu: MenuItemType[] = [
    {
      label: t("sidebar.home"),
      to: "/",
      icon: IoMdHome,
    },
    {
      label: t("sidebar.tasks.parent"),
      icon: FaTasks,
      children: [
        {
          // icon: FaCircle,
          label: t("sidebar.tasks.all"),
          to: "/tasks",
        },
        {
          // icon: FaCircle,
          label: t("sidebar.tasks.my"),
          to: "/tasks",
          filter: { assignee: "$user" },
        },
        {
          // icon: FaCircle,
          label: t("sidebar.tasks.new"),
          to: "/tasks",
          filter: { status: "New" },
        },
        {
          // icon: FaCircle,
          label: t("sidebar.tasks.attn"),
          to: "/tasks",
          filter: { attn: "$user" },
        },

      ],
    },
    {
      label: t("sidebar.examples"),
      to: "/examples",
      icon: FaRegFileAlt,
    },
    {
      label: "testy tasks pageflow",
      to: "/entity/tasks",
      icon: IoMdHome,
    },
  ];

  return (
    <Sidebar
      className={`h-full border-r dark:border-r dark:border-gray-700 border-gray-200 absolute ${sidebar ? "" : "hidden"
        } z-10 lg:relative lg:block`}
      onClick={() => {
        setSidebar(false);
      }}
    >
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <div className="flex justify-center lg:hidden pb-2">
            <Link to="/">
              <img alt="Linkinq" src={logo} style={{ height: "20px" }} />
            </Link>
          </div>
          {renderMenuItems(props.admin ? menuAdmin : menu, goTo)}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}

const renderMenuItems = (
  items: MenuItemType[],
  goTo: (item: MenuItemType) => void
) => {
  return items.map((item, index) => {
    if (item.children) {
      return (
        <Sidebar.Collapse
          key={index + item.label + "ch"}
          icon={item.icon}
          label={item.label}
        >
          {renderMenuItems(item.children, goTo)}
        </Sidebar.Collapse>
      );
    }

    return (
      <Sidebar.Item
        as="span"
        key={index + item.label}
        icon={item.icon}
        onClick={() => {
          goTo(item);
        }}
      >
        {item.label}
      </Sidebar.Item>
    );
  });
};
