import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, List, PlusCircle, PieChart, Users, LogOut, Settings } from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const viewerLinks = [
    { to: "/viewer", label: "Dashboard", icon: Home },
    { to: "/viewer/transactions", label: "Transactions", icon: List },
    { to: "/viewer/create", label: "Add Transaction", icon: PlusCircle },
  ];

  const analystLinks = [
    { to: "/analyst", label: "Analytics", icon: PieChart },
    { to: "/analyst/accounts", label: "All Accounts", icon: Users },
  ];

  const adminLinks = [
    { to: "/admin", label: "Admin Panel", icon: Settings },
    { to: "/admin/users", label: "Manage Users", icon: Users },
  ];

  let links = [];
  if (user.role === "viewer") links = viewerLinks;
  if (user.role === "analyst") links = analystLinks;
  if (user.role === "admin") links = adminLinks;

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col transition-all duration-300">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          FinTrack
        </h2>
        <div className="mt-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
          {user.role} Portal
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-blue-600 shadow-lg shadow-blue-500/30 text-white" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-blue-400"} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800 rounded-xl mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
