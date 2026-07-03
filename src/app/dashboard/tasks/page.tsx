"use client";

import React, { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash2, Search, CheckCircle2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  projectId: number;
  userId?: number;
  priority: string;
  dueDate: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [userRole, setUserRole] = useState<string>("employee");

  const fetchTasks = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [taskRes, authRes] = await Promise.all([
        fetch("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setUserRole(authData.role);
      }

      if (taskRes.ok) {
        const data = await taskRes.json();
        const tasksArray = Array.isArray(data) ? data : (data.data || []);
        setTasks(tasksArray);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const executeDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Task deleted successfully");
        fetchTasks();
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("An error occurred");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredTasks = tasks.filter(t => 
    (t.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        {userRole !== "employee" && (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/60 dark:ring-slate-800/60 overflow-hidden rounded-[2rem]">
        <CardHeader className="px-8 pb-6 pt-8 border-b border-slate-200/40 dark:border-slate-800/60 bg-white/20 dark:bg-slate-900/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3 animate-gradient-x">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              All Tasks
            </CardTitle>
            <div className="w-full sm:w-80 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
              <Input 
                placeholder="Search tasks..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 bg-white/60 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-2xl shadow-sm hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-300"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-800/60 backdrop-blur-md">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-8 uppercase tracking-wider text-xs">Title</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">Priority</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">Due Date</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 py-5 px-8 uppercase tracking-wider text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="relative flex h-8 w-8 items-center justify-center">
                          <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></div>
                          <div className="relative inline-flex h-4 w-4 rounded-full bg-indigo-500"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Loading amazing tasks...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckCircle2 className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                        <span className="text-base font-medium text-slate-600 dark:text-slate-400">No tasks found</span>
                        <span className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search criteria</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task, index) => (
                    <TableRow 
                      key={task.id}
                      className={`group border-b border-slate-100/50 dark:border-slate-800/40 transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/20 dark:bg-slate-900/20'}`}
                    >
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm shadow-inner">
                            {task.title.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-base">{task.title}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 shadow-sm capitalize">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          {task.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize shadow-sm ${
                          task.priority === 'high' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        } border`}>
                          {task.priority || 'Medium'}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-slate-600 dark:text-slate-300">
                        {task.dueDate ? new Date(task.dueDate).toLocaleString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right px-8 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-all shadow-sm hover:shadow"
                            onClick={() => {
                              setViewingTask(task);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {userRole !== "employee" && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-all shadow-sm hover:shadow"
                                onClick={() => {
                                  setEditingTask(task);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-all shadow-sm hover:shadow"
                                onClick={() => setDeleteId(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <TaskFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={editingTask}
        onSuccess={fetchTasks}
      />

      <TaskDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        task={viewingTask}
      />
    
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={executeDelete} 
        title="Confirm Deletion" 
        description="Are you sure you want to delete this task?" 
      />
    </div>
  );
}
