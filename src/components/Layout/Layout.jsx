import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[1050] lg:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        <Header
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto relative z-10">
          <div className="animate-fade-in h-full">
            <Outlet />
          </div>
        </main>

        <footer className="px-8 py-6 text-center text-xs font-bold text-text-secondary opacity-40 uppercase tracking-widest border-t border-border/50">
          Mind Gym Admin Interface &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default Layout;
