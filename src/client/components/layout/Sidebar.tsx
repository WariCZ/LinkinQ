"use client";
import { useState, useEffect, useContext } from "react";
// import useLocalStorage from "../../lib/useLocalStorage";
import { Sidebar } from "flowbite-react";
import { IoMdHome } from "react-icons/io";
// import { sidebarContext } from "../sidebarProvider";
import { HiFolderOpen } from "react-icons/hi2";
import { HiInboxArrowDown } from "react-icons/hi2";
import { HiServer } from "react-icons/hi";
import { BsKanban } from "react-icons/bs";
import { FaAddressBook } from "react-icons/fa";
import { PiUserSquareFill } from "react-icons/pi";
import { FaUsersBetweenLines } from "react-icons/fa6";
import { IoLogOutOutline } from "react-icons/io5";
import { MdTask } from "react-icons/md";
import { RiFileList2Fill } from "react-icons/ri";
import { FaTools } from "react-icons/fa";
import { TbTableOptions, TbTable } from "react-icons/tb";
import { FaBuffer } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { FaProjectDiagram } from "react-icons/fa";
import { FaTable } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaHubspot } from "react-icons/fa";

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
    // {
    //   label: "test",
    //   icon: IoMdHome,
    //   children: [
    //     {
    //       label: "kuk1",
    //       to: "/sdw",
    //       icon: IoMdHome,
    //     },
    //   ],
    // },
  ];

  const menu: MenuItemType[] = [
    {
      label: "Home",
      to: "/",
      icon: IoMdHome,
    },
    {
      label: "Tasks",
      to: "/tasks",
      icon: FaTasks,
    },
    // {
    //   label: "serverScript",
    //   to: "/admin/serverScript",
    //   icon: FaCode,
    // },
    // {
    //   label: "entity",
    //   to: "/admin/entity",
    //   icon: FaTable,
    // },
    // {
    //   label: "test",
    //   icon: IoMdHome,
    //   children: [
    //     {
    //       label: "kuk1",
    //       to: "/sdw",
    //       icon: IoMdHome,
    //     },
    //   ],
    // },
  ];

  return (
    <Sidebar
      className={`h-full border-r dark:border-r dark:border-gray-700 border-gray-200`}
    >
      <Sidebar.Items>
        <Sidebar.ItemGroup>
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
          key={index + item.label}
          icon={item.icon}
          label={item.label}
        >
          {renderMenuItems(item.children)}
        </Sidebar.Collapse>
      );
    }

    return (
      <Link to={item.to || "#"}>
        <Sidebar.Item key={index + item.label} icon={item.icon}>
          {item.label}
        </Sidebar.Item>
      </Link>
    );
  });
};
// return (
//   <Sidebar
//     className={`h-full border-r dark:border-r dark:border-gray-700 border-gray-200`}
//   >
//     <Sidebar.Items>
//       <Sidebar.ItemGroup>
//         <Sidebar.Item icon={IoMdHome}>
//           <Link to="/">Home</Link>
//         </Sidebar.Item>
//         <Sidebar.Item icon={HiInboxArrowDown}>
//           <Link to="/protected">Inbox</Link>
//         </Sidebar.Item>
//         <Sidebar.Item icon={BsKanban}>
//           <Link to="/public2">Kanban</Link>
//         </Sidebar.Item>
//         <Sidebar.Item href="#" icon={FaAddressBook}>
//           Uživatelé
//         </Sidebar.Item>
//         <Sidebar.Item href="#" icon={PiUserSquareFill}>
//           Portál občana
//         </Sidebar.Item>
//         <Sidebar.Collapse icon={FaUsersBetweenLines} label="Portál úředníka">
//           <Sidebar.Item href="/list">Otevřené</Sidebar.Item>
//           <Sidebar.Item href="/list">Vyřízené</Sidebar.Item>
//         </Sidebar.Collapse>
//         <Sidebar.Collapse label="Žádosti" icon={HiServer}>
//           <Sidebar.Item href="#">Otevřené</Sidebar.Item>
//           <Sidebar.Item href="#">Vyřízené</Sidebar.Item>
//           <Sidebar.Item href="#">Archivované</Sidebar.Item>
//           <Sidebar.Collapse
//             label="Spisy"
//             icon={HiFolderOpen}
//             className="pl-2"
//           >
//             <Sidebar.Item href="#">Otevřené</Sidebar.Item>
//             <Sidebar.Item href="#">Vyřízené</Sidebar.Item>
//           </Sidebar.Collapse>
//         </Sidebar.Collapse>
//         <Sidebar.Collapse label="Spisy" icon={HiFolderOpen}>
//           <Sidebar.Item href="#">Otevřené</Sidebar.Item>
//           <Sidebar.Item href="#">Vyřízené</Sidebar.Item>
//         </Sidebar.Collapse>
//         <Sidebar.Item href="#" icon={MdTask}>
//           Požadavky
//         </Sidebar.Item>
//         <Sidebar.Item href="#" icon={RiFileList2Fill}>
//           Spis
//         </Sidebar.Item>
//         <Sidebar.Collapse
//           label="Vývojář"
//           icon={FaTools}
//           data-testid="navigation-item-developer"
//         >
//           <Sidebar.Item
//             href="/metamodel"
//             icon={TbTableOptions}
//             data-testid="navigation-item-metamodel"
//           >
//             Metamodel
//           </Sidebar.Item>
//           <Sidebar.Item
//             href="/querydata"
//             icon={TbTable}
//             data-testid="navigation-item-querydata"
//           >
//             Query data
//           </Sidebar.Item>
//         </Sidebar.Collapse>
//       </Sidebar.ItemGroup>
//     </Sidebar.Items>
//   </Sidebar>
// );
