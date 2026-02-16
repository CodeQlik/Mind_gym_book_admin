import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  BookMarked,
  Tags,
  ChevronDown,
  CreditCard,
  Sparkles,
} from "lucide-react";

import { useSelector } from "react-redux";

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
      icon: <LayoutDashboard size={18} />,
      path: "/dashboard",
    },
    {
      title: "Categories",
      icon: <Tags size={18} />,
      path: "/categories",
    },
    { title: "Books", icon: <BookOpen size={18} />, path: "/books" },
    { title: "Users", icon: <Users size={18} />, path: "/users" },
    { title: "Analytics", icon: <BarChart3 size={18} />, path: "/analytics" },
    {
      title: "Subscribe",
      icon: <CreditCard size={18} />,
      path: "/subscribe",
      subItems: [
        { title: "Plan", path: "/subscribe" },
        { title: "Subscribe User", path: "/subscribe/users" },
      ],
    },
    { title: "Settings", icon: <Settings size={18} />, path: "/settings" },
  ];

  React.useEffect(() => {
    const newOpenDropdowns = {};
    menuItems.forEach((item) => {
      if (item.subItems && location.pathname.startsWith(item.path)) {
        newOpenDropdowns[item.title] = true;
      }
    });
    setOpenDropdowns(newOpenDropdowns);
  }, [location.pathname]);

  const isSubItemActive = (subItems) => {
    return subItems?.some((subItem) => location.pathname === subItem.path);
  };

  return (
    <aside
      className={`h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 sticky top-0 z-[1100] ${
        isOpen ? "w-[280px]" : "w-[88px]"
      }`}
    >
      <div className="h-[80px] px-6 flex items-center border-b border-border">
        <div className="flex items-center gap-3 whitespace-nowrap overflow-hidden">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <BookMarked size={22} className="text-white" />
          </div>
          {isOpen && (
            <span className="text-2xl font-black text-text-primary tracking-tighter font-['Outfit']">
              Mind Gym
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 overflow-y-auto no-scrollbar">
        <ul className="space-y-1.5 font-['Inter']">
          {menuItems.map((item) => {
            const isActive =
              location.pathname.startsWith(item.path) ||
              isSubItemActive(item.subItems);

            return (
              <li key={item.title}>
                {item.subItems && isOpen ? (
                  <div className="flex flex-col">
                    <div
                      className={`flex items-center p-3 rounded-xl gap-3.5 transition-all duration-200 cursor-pointer group relative ${
                        isActive
                          ? "bg-primary text-white shadow-xl shadow-primary/25 active-nav-item"
                          : "text-text-secondary hover:bg-background hover:text-text-primary"
                      }`}
                      onClick={() => toggleDropdown(item.title)}
                    >
                      <span
                        className={`shrink-0 transition-colors ${isActive ? "text-white" : "opacity-70 group-hover:opacity-100"}`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`text-[14px] font-semibold tracking-tight transition-colors ${isActive ? "text-white" : ""}`}
                      >
                        {item.title}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`ml-auto transition-transform duration-300 ${openDropdowns[item.title] ? "rotate-180" : ""} ${isActive ? "text-white/80" : "opacity-40"}`}
                      />
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-300 pl-11 flex flex-col gap-1 ${
                        openDropdowns[item.title]
                          ? "max-h-[500px] mt-2 mb-2"
                          : "max-h-0"
                      }`}
                    >
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          end={subItem.path === item.path}
                          className={({ isActive: isSubActive }) =>
                            `text-[13px] py-1.5 px-4 rounded-lg transition-all duration-200 relative flex items-center gap-2 group ${
                              isSubActive
                                ? "text-primary font-bold"
                                : "text-text-secondary hover:text-text-primary"
                            }`
                          }
                        >
                          <div
                            className={`w-1 h-1 rounded-full transition-all duration-300 ${location.pathname === subItem.path ? "bg-primary scale-150" : "bg-secondary/40 group-hover:bg-secondary"}`}
                          />
                          {subItem.title}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive: isLinkActive }) =>
                      `flex items-center ${
                        isOpen
                          ? "p-3 rounded-xl"
                          : "p-0 w-12 h-12 mx-auto rounded-xl flex justify-center"
                      } gap-3.5 transition-all duration-200 group relative ${
                        isLinkActive
                          ? "bg-primary text-white shadow-xl shadow-primary/25 active-nav-item"
                          : "text-text-secondary hover:bg-background hover:text-text-primary"
                      }`
                    }
                    title={!isOpen ? item.title : ""}
                  >
                    <span
                      className={`shrink-0 transition-colors ${location.pathname === item.path ? "text-white" : "opacity-70 group-hover:opacity-100"}`}
                    >
                      {item.icon}
                    </span>
                    {isOpen && (
                      <span className="text-[14px] font-semibold tracking-tight">
                        {item.title}
                      </span>
                    )}
                    {isOpen && item.path === location.pathname && (
                      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/40" />
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
