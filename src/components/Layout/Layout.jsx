import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 selection:text-primary">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 relative">
        <Header
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 pt-4 sm:pt-5 lg:pt-6 max-w-[1920px] mx-auto w-full relative z-10 transition-all duration-500">
          {/* Decorative Top Gradient for Main Content */}
          <div className="absolute top-0 left-0 w-full h-[300px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

          <div className="animate-fade-in h-full">
            <Outlet />
          </div>
        </main>

        <footer className="px-12 py-8 text-center text-[0.7rem] font-black text-text-secondary opacity-30 uppercase tracking-[0.2em]">
          Mind Gym Administrative Interface &copy; {new Date().getFullYear()}{" "}
          &bull; Built with Tailwind CSS
        </footer>
      </div>
    </div>
  );
};

export default Layout;
