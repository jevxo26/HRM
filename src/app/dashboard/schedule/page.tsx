"use client";

import React, { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash2, Search, Calendar, Coffee, Zap, Sun, Cloud, Star, CloudRain, Moon, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScheduleFormModal } from "./ScheduleFormModal";
import { toast } from "sonner";

interface Schedule {
  id: number;
  userId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  user?: { name: string };
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [userRole, setUserRole] = useState<string>("employee");

  const fetchSchedules = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [res, authRes] = await Promise.all([
        fetch("/api/schedules", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (authRes.ok) {
        const authData = await authRes.json();
        setUserRole(authData.data?.role || authData.role || 'employee');
      }

      if (res.ok) {
        const data = await res.json();
        const schedulesArray = Array.isArray(data) ? data : (data.data || []);
        setSchedules(schedulesArray);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const executeDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Schedule deleted successfully");
        fetchSchedules();
      } else {
        toast.error("Failed to delete schedule");
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      toast.error("An error occurred");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredSchedules = schedules.filter(s => 
    (s.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.dayOfWeek || "").toLowerCase().includes(search.toLowerCase())
  );

  const groupedSchedules = React.useMemo(() => {
    const grouped: Record<number, { name: string, schedules: Record<string, Schedule> }> = {};
    
    filteredSchedules.forEach(schedule => {
      if (!grouped[schedule.userId]) {
        grouped[schedule.userId] = {
          name: schedule.user?.name || `User ID: ${schedule.userId}`,
          schedules: {}
        };
      }
      grouped[schedule.userId].schedules[schedule.dayOfWeek] = schedule;
    });
    
    return Object.values(grouped);
  }, [filteredSchedules]);

  const daysOfWeek = [
    { name: "Monday", icon: Coffee },
    { name: "Tuesday", icon: Zap },
    { name: "Wednesday", icon: Sun },
    { name: "Thursday", icon: Cloud },
    { name: "Friday", icon: Star },
    { name: "Saturday", icon: CloudRain },
    { name: "Sunday", icon: Moon }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        {userRole !== "employee" && (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => {
              setEditingSchedule(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-2xl bg-[#0F0F12] overflow-hidden rounded-[2rem] border border-white/5">
        <CardHeader className="px-8 pb-6 pt-8 border-b border-white/5 bg-[#0F0F12]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl">
                  <Calendar className="h-6 w-6 text-indigo-400" />
                </div>
                Weekly Schedule
              </CardTitle>
              <p className="text-slate-400 mt-2 text-sm ml-14">Manage weekly employee shifts and meetings</p>
            </div>
            <div className="w-full sm:w-80 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
              <Input 
                placeholder="Search employee..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 bg-white/5 border-white/10 text-white focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-2xl shadow-sm hover:bg-white/10 transition-all duration-300 placeholder:text-slate-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-[#0F0F12]">
          <div className="w-full overflow-x-auto p-6">
            <div className="min-w-[1000px] border border-white/10 rounded-2xl overflow-hidden bg-[#16161A] pb-1">
              <div className="grid grid-cols-8 border-b border-white/10 text-slate-400">
                <div className="px-6 py-4 flex items-center gap-2 border-r border-white/10">
                  <User className="h-4 w-4 text-indigo-400" />
                  <span className="font-semibold text-white text-sm">Employee</span>
                </div>
                {daysOfWeek.map((day) => {
                  const Icon = day.icon;
                  return (
                    <div key={day.name} className="px-4 py-4 flex flex-col items-center justify-center gap-1 border-r border-white/10 last:border-r-0">
                      <Icon className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-medium text-white">{day.name.substring(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Progress Bar styled element directly under header */}
              <div className="w-full px-2">
                <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400 rounded-full my-1 shadow-[0_0_10px_rgba(99,102,241,0.3)]"></div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center">
                      <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></div>
                      <div className="relative inline-flex h-4 w-4 rounded-full bg-indigo-500"></div>
                    </div>
                  </div>
                </div>
              ) : groupedSchedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 h-48">
                  <Calendar className="h-10 w-10 text-slate-600 mb-2" />
                  <span className="text-base font-medium text-slate-400">No scheduled events found</span>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {groupedSchedules.map((userGroup, index) => (
                    <div key={index} className="grid grid-cols-8 hover:bg-white/5 transition-colors duration-200">
                      <div className="px-6 py-4 flex items-center gap-3 border-r border-white/5">
                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                          {userGroup.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-200 text-sm truncate">{userGroup.name}</span>
                      </div>
                      
                      {daysOfWeek.map((day) => {
                        const scheduleForDay = userGroup.schedules[day.name];
                        return (
                          <div 
                            key={day.name} 
                            className={`px-3 py-4 flex items-center justify-center border-r border-white/5 last:border-r-0 ${scheduleForDay ? 'cursor-pointer hover:bg-white/10' : ''}`}
                            onClick={() => {
                              if (scheduleForDay && userRole !== "employee") {
                                setEditingSchedule(scheduleForDay);
                                setIsModalOpen(true);
                              }
                            }}
                          >
                            {scheduleForDay ? (
                              <div className="flex flex-col items-center text-center">
                                <span className="text-xs font-semibold text-emerald-400">{scheduleForDay.startTime}</span>
                                <span className="text-[10px] text-slate-500">-</span>
                                <span className="text-xs font-semibold text-rose-400">{scheduleForDay.endTime}</span>
                              </div>
                            ) : (
                              <span className="text-slate-700 text-xl font-light">-</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ScheduleFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        schedule={editingSchedule}
        onSuccess={fetchSchedules}
        userRole={userRole}
      />
    
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={executeDelete} 
        title="Confirm Deletion" 
        description="Are you sure you want to delete this schedule?" 
      />
    </div>
  );
}
