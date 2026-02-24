import React, { useState, useEffect } from "react";
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
  Bell,
  Package,
  Store,
} from "lucide-react";

import { useSelector, useDispatch } from "react-redux";
import Logo from "../../assets/mgblogo.jpeg";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
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
    {
      title: "Subscribe",
      icon: <CreditCard size={18} />,
      path: "/subscribe",
      subItems: [
        { title: "Plan", path: "/subscribe" },
        { title: "Subscribe User", path: "/subscribe/users" },
      ],
    },
    {
      title: "Payments",
      icon: <Sparkles size={18} />,
      path: "/payments",
    },
    {
      title: "Orders",
      icon: <Package size={18} />,
      path: "/orders",
    },
    {
      title: "Marketplace",
      icon: <Store size={18} />,
      path: "/marketplace",
    },
    {
      title: "Notifications",
      icon: <Bell size={18} />,
      path: "/notifications",
    },
    { title: "Analytics", icon: <BarChart3 size={18} />, path: "/analytics" },
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

    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 1024 && isOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  const isSubItemActive = (subItems) => {
    return subItems?.some((subItem) => location.pathname === subItem.path);
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 h-screen bg-surface border-r border-border/50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[1100] ${
        isOpen
          ? "w-[280px] translate-x-0"
          : "w-[90px] -translate-x-full lg:translate-x-0"
      } shadow-[0_0_40px_rgba(0,0,0,0.02)]`}
    >
      {/* Brand Section */}
      <div
        className={`h-[110px] flex items-center mb-4 transition-all duration-500 ${isOpen ? "px-7" : "px-4 justify-center"}`}
      >
        <div
          className={`flex items-center gap-4 whitespace-nowrap overflow-hidden rounded-[1.5rem] bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 shadow-sm transition-all hover:border-primary/20 group/brand ${isOpen ? "w-full p-2.5" : "w-14 h-14 p-2 justify-center"}`}
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-md border border-border/40 overflow-hidden p-1.5 transition-all group-hover/brand:scale-110 duration-500">
            <img
              src={Logo}
              alt="MGB Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {isOpen && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-700">
              <span className="text-[1.4rem] font-black text-text-primary tracking-tight font-['Outfit'] leading-none mb-1 bg-linear-to-r from-text-primary via-text-primary/90 to-primary bg-clip-text text-transparent">
                Mind Gym
              </span>
              <span className="text-[10px] font-black text-primary/70 uppercase tracking-[0.3em] leading-none opacity-90">
                PUBLICATION
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 px-4 overflow-y-auto no-scrollbar pb-10">
        <div className="mb-6 px-4">
          <span
            className={`text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.2em] ${!isOpen && "text-center block"}`}
          >
            {isOpen ? "Main System" : "•••"}
          </span>
        </div>

        <ul className="space-y-2 font-['Inter']">
          {menuItems.map((item) => {
            const isActive =
              location.pathname.startsWith(item.path) ||
              isSubItemActive(item.subItems);

            return (
              <li key={item.title} className="relative group/li">
                {item.subItems && isOpen ? (
                  <div className="flex flex-col">
                    <div
                      className={`flex items-center p-3.5 rounded-2xl gap-3.5 transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-text-secondary hover:bg-background/80 hover:text-text-primary"
                      }`}
                      onClick={() => toggleDropdown(item.title)}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent pointer-events-none" />
                      )}
                      <span
                        className={`shrink-0 transition-all duration-300 ${isActive ? "scale-110" : "opacity-60 group-hover:opacity-100 group-hover:scale-110"}`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`text-[14px] font-bold tracking-tight transition-all ${isActive ? "translate-x-1" : "group-hover:translate-x-1"}`}
                      >
                        {item.title}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`ml-auto transition-transform duration-500 ${openDropdowns[item.title] ? "rotate-180" : ""} ${isActive ? "text-white/80" : "opacity-30"}`}
                      />
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-500 flex flex-col gap-1 ease-in-out ${
                        openDropdowns[item.title]
                          ? "max-h-[500px] mt-2 mb-2 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          end={subItem.path === item.path}
                          className={({ isActive: isSubActive }) =>
                            `text-[13px] py-2.5 px-12 rounded-xl transition-all duration-300 relative flex items-center gap-3 group/sub ${
                              isSubActive
                                ? "text-primary font-black bg-primary/5 shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.02)]"
                                : "text-text-secondary hover:text-text-primary hover:bg-background/40"
                            }`
                          }
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${location.pathname === subItem.path ? "bg-primary scale-125 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" : "bg-border group-hover/sub:bg-primary group-hover/sub:scale-125"}`}
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
                          ? "p-3.5 rounded-2xl"
                          : "p-0 w-14 h-14 mx-auto rounded-2xl flex justify-center"
                      } gap-3.5 transition-all duration-300 group relative overflow-hidden ${
                        isLinkActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20 active-nav-item"
                          : "text-text-secondary hover:bg-background/80 hover:text-text-primary"
                      }`
                    }
                    title={!isOpen ? item.title : ""}
                  >
                    {location.pathname === item.path && (
                      <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent pointer-events-none" />
                    )}

                    <span
                      className={`shrink-0 transition-all duration-300 ${location.pathname === item.path ? "scale-110" : "opacity-60 group-hover:opacity-100 group-hover:scale-110"}`}
                    >
                      {React.cloneElement(item.icon, {
                        size: isOpen ? 20 : 22,
                      })}
                    </span>

                    {isOpen && (
                      <span
                        className={`text-[14px] font-bold tracking-tight flex-1 transition-all ${location.pathname === item.path ? "translate-x-1" : "group-hover:translate-x-1"}`}
                      >
                        {item.title}
                      </span>
                    )}

                    {/* Badge System */}
                    {item.badge > 0 && (
                      <span
                        className={`absolute ${isOpen ? "right-4" : "top-3 right-3"} min-w-[18px] h-4.5 px-1 rounded-full text-[9px] font-black flex items-center justify-center leading-none shadow-sm transition-all ${
                          location.pathname.startsWith(item.path)
                            ? "bg-white text-primary"
                            : "bg-primary text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {!isOpen && location.pathname === item.path && (
                      <div className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
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
