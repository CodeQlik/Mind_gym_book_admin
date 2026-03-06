import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  Tags,
  ChevronDown,
  CreditCard,
  Sparkles,
  Bell,
  Package,
} from "lucide-react";

import { useSelector } from "react-redux";
import Logo from "../../assets/mgblogo.jpeg";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (title) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={22} />,
      path: "/dashboard",
    },
    {
      title: "Categories",
      icon: <Tags size={22} />,
      path: "/categories",
    },
    { title: "Books", icon: <BookOpen size={22} />, path: "/books" },
    { title: "Users", icon: <Users size={22} />, path: "/users" },
    {
      title: "Subscribe",
      icon: <CreditCard size={22} />,
      path: "/subscribe",
      subItems: [
        { title: "Plan", path: "/subscribe" },
        { title: "Subscribe User", path: "/subscribe/users" },
      ],
    },
    {
      title: "Payments",
      icon: <Sparkles size={22} />,
      path: "/payments",
    },
    {
      title: "Orders",
      icon: <Package size={22} />,
      path: "/orders",
    },
    {
      title: "Notifications",
      icon: <Bell size={22} />,
      path: "/notifications",
    },
    { title: "Settings", icon: <Settings size={22} />, path: "/settings" },
  ];

  useEffect(() => {
    const newOpenDropdowns = {};
    menuItems.forEach((item) => {
      if (item.subItems && location.pathname.startsWith(item.path)) {
        newOpenDropdowns[item.title] = true;
      }
    });
    setOpenDropdowns(newOpenDropdowns);

    if (window.innerWidth < 1024 && isOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  const isSubItemActive = (subItems) => {
    const cleanCurrentPath = location.pathname.replace(/\/$/, "");
    return subItems?.some((subItem) => {
      const cleanSubPath = subItem.path.replace(/\/$/, "");
      return cleanCurrentPath === cleanSubPath;
    });
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 h-screen bg-surface border-r border-border transition-all duration-300 z-[1100] ${
        isOpen ? "w-[260px]" : "w-[80px] -translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Brand Section */}
      <div
        className={`h-[80px] flex items-center mb-2 px-6 ${!isOpen && "justify-center px-0"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded shadow-sm flex items-center justify-center shrink-0 p-1">
            <img
              src={Logo}
              alt=""
              className="w-full h-full object-contain rounded-sm"
            />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-text-primary tracking-tight leading-none">
                Mind Gym
              </span>
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
                Publication
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 px-3 overflow-y-auto no-scrollbar pb-10">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isSubMenuOpenCheck = location.pathname.startsWith(item.path);
            const isActive = item.subItems
              ? isSubItemActive(item.subItems)
              : location.pathname.replace(/\/$/, "") ===
                item.path.replace(/\/$/, "");

            return (
              <li key={item.title}>
                {item.subItems && isOpen ? (
                  <div className="flex flex-col">
                    <div
                      className={`flex items-center p-2.5 rounded-lg gap-3 transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-text-secondary hover:bg-background"
                      }`}
                      onClick={() => toggleDropdown(item.title)}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="text-[16px] font-semibold">
                        {item.title}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`ml-auto transition-transform ${openDropdowns[item.title] || isActive ? "rotate-180" : ""}`}
                      />
                    </div>

                    {openDropdowns[item.title] && (
                      <div
                        className="flex flex-col gap-1 mt-1 ml-4 border-l border-border pl-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            end
                            className={({ isActive: isSubActive }) =>
                              `text-[15px] py-1.5 px-4 rounded-md transition-all ${
                                isSubActive
                                  ? "text-primary font-bold bg-primary/5 shadow-sm"
                                  : "text-text-secondary hover:text-text-primary hover:bg-background"
                              }`
                            }
                          >
                            {subItem.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive: isLinkActive }) =>
                      `flex items-center ${
                        isOpen
                          ? "p-2.5 rounded-lg"
                          : "p-3 rounded-lg justify-center"
                      } gap-3 transition-all ${
                        isLinkActive
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:bg-background"
                      }`
                    }
                    title={!isOpen ? item.title : ""}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {isOpen && (
                      <span className="text-[16px] font-semibold">
                        {item.title}
                      </span>
                    )}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
