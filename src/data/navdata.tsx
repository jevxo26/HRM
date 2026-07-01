import { LayoutDashboard, Users, Settings, Briefcase, ListTodo, Calendar, ClipboardCheck, Clock, FileText } from "lucide-react";

export const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["cto", "ceo", "founder", "teamlead", "employee"] },
  { name: "Projects", href: "/dashboard/projects", icon: Briefcase, roles: ["cto", "ceo", "founder", "teamlead", "employee"] },
  { name: "Tasks", href: "/dashboard/tasks", icon: ListTodo, roles: ["cto", "ceo", "founder", "teamlead", "employee"] },
  { name: "Team", href: "/dashboard/team", icon: Users, roles: ["cto", "ceo", "founder", "teamlead"] },
  { name: "Users", href: "/dashboard/users", icon: Users, roles: ["cto", "ceo", "founder", "teamlead"] },
  { name: "Attendance", href: "/dashboard/attendance", icon: ClipboardCheck, roles: ["employee"] },
  { name: "Leave", href: "/dashboard/leave", icon: Calendar, roles: ["hr", "cto", "ceo", "founder", "teamlead", "employee"] },
  { name: "Leave Type", href: "/dashboard/leave-type", icon: FileText, roles: ["hr", "cto", "ceo", "founder", "teamlead", "employee"] },
  { name: "Schedule", href: "/dashboard/schedule", icon: Clock, roles: ["hr", "cto", "ceo", "founder", "teamlead", "employee"] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["cto", "ceo", "founder", "teamlead"] },
];
