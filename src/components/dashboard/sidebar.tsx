"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { navItems } from "@/data/navdata";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("employee");
  const [userData, setUserData] = useState<{name: string, email: string} | null>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const user = data.data;
          setRole(user?.role || "employee");
          setUserData({ name: user?.name || "User", email: user?.email || "" });
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/20">
        {!isCollapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent truncate">
            jevxo HRM
          </span>
        )}
        {isCollapsed && (
          <div className="mx-auto text-indigo-500">
            <Menu size={24} />
          </div>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md hover:bg-indigo-600 transition-colors z-30"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 group relative",
                isActive
                  ? "bg-indigo-500/10 text-indigo-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/40"
                  : "text-slate-600 hover:bg-white/40 hover:text-indigo-600 border border-transparent"
              )}
            >
              <item.icon
                className={cn("shrink-0", isCollapsed ? "mx-auto" : "mr-3", isActive ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-600")}
                size={20}
              />
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/20">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "")}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs uppercase">
            {userData?.name ? userData.name.substring(0, 2) : "JD"}
          </div>
          {!isCollapsed && (
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-slate-700 truncate">{userData?.name || "Loading..."}</p>
              <p className="text-xs text-slate-500 truncate">{userData?.email || "..."}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
