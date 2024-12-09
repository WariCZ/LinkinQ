"use client";
import { useState, useEffect, useContext } from "react";
// import useLocalStorage from "../../lib/useLocalStorage";
import { Sidebar } from "flowbite-react";
import { IoMdHome } from "react-icons/io";

import { FaBuffer } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { FaProjectDiagram } from "react-icons/fa";
import { FaTable } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaHubspot } from "react-icons/fa";
import useStore from "@/client/store";
import logo from "../../static/logo.png";
import { FaCircle } from "react-icons/fa";

type Label = {
  label: string;
  icon?: React.FC;
};

type WithTo = Label & {
  to: string; // Povinný atribut 'to', pokud je přítomen
  children?: never; // Pokud je 'to', nesmí být 'children'
};

type WithChildren = Label & {
  children: MenuItemType[]; // Povinný atribut 'children', pokud je přítomen
  to?: never; // Pokud jsou 'children', nesmí být 'to'
};
type MenuItemType = WithTo | WithChildren;

export default function DashboardSidebar(props: { admin?: boolean }) {
  // const context = useContext(sidebarContext);
  const sidebar = useStore((state) => state.sidebar);
  const setSidebar = useStore((state) => state.setSidebar);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 800) {
        // context.toggleCollapsed();
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
      icon: FaTable,
    },
    {
      label: "Triggers",
      to: "/admin/triggers",
      icon: FaHubspot,
    },
  ];

  const menu: MenuItemType[] = [
    {
      label: "Home",
      to: "/",
      icon: IoMdHome,
    },
    {
      label: "Tasks",
      icon: FaTasks,
      children: [
        {
          // icon: FaCircle,
          label: "All tasks",
          to: "/tasks",
        },
        {
          // icon: FaCircle,
          label: "My tasks",
          to: "/tasks?filter=mytasks",
        },
        {
          // icon: FaCircle,
          label: "Open tasks",
          to: "/tasks?filter=open",
        },
        {
          // icon: FaCircle,
          label: "K pozornosti",
          to: "/tasks?filter=attn",
        },
      ],
    },
  ];

  return (
    <Sidebar
      className={`h-full border-r dark:border-r dark:border-gray-700 border-gray-200 absolute ${
        sidebar ? "" : "hidden"
      } z-10 lg:relative lg:block`}
      onClick={() => {
        setSidebar(false);
      }}
    >
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <div className="flex justify-center lg:hidden pb-2">
            <Link to="/">
              <img alt="Prodigi logo" src={logo} style={{ height: "20px" }} />
            </Link>
          </div>
          {renderMenuItems(props.admin ? menuAdmin : menu)}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}

const renderMenuItems = (items: MenuItemType[]) => {
  return items.map((item, index) => {
    if (item.children) {
      return (
        <Sidebar.Collapse
          key={index + item.label + "ch"}
          icon={item.icon}
          label={item.label}
        >
          {renderMenuItems(item.children)}
        </Sidebar.Collapse>
      );
    }

    return (
      <Link to={item.to || "#"} key={index + item.label}>
        <Sidebar.Item as="span" icon={item.icon}>
          {item.label}
        </Sidebar.Item>
      </Link>
    );
  });
};
