import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8F9FB] dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 overflow-hidden selection:bg-rose-100 selection:text-rose-900 dark:selection:bg-rose-900 dark:selection:text-rose-100 transition-colors duration-300">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
