"use client";

import React, { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash2, Search, CheckCircle2, Eye, GripVertical } from "lucide-react";
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
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTaskId === null) return;
    
    if (newStatus === "completed" && ["employee", "hr"].includes(userRole)) {
      toast.error("Only Admins or CTO can mark a task as completed");
      setDraggedTaskId(null);
      return;
    }

    const taskToUpdate = tasks.find(t => t.id === draggedTaskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) {
      setDraggedTaskId(null);
      return;
    }

    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === draggedTaskId ? { ...t, status: newStatus } : t));
    
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch(`/api/tasks/${draggedTaskId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update status");
        }
        
        toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
      } catch (error: any) {
        toast.error(error.message || "Failed to update task status");
        setTasks(previousTasks);
      }
    }
    setDraggedTaskId(null);
  };

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
        setUserRole(authData.data?.role || authData.role || 'employee');
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

  const columns = [
    { id: "pending", title: "To Do", bgColor: "bg-slate-100 dark:bg-slate-800/50", borderColor: "border-slate-200 dark:border-slate-700" },
    { id: "in_progress", title: "In Progress", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", borderColor: "border-indigo-200 dark:border-indigo-800" },
    { id: "in_review", title: "In Review", bgColor: "bg-amber-50 dark:bg-amber-900/20", borderColor: "border-amber-200 dark:border-amber-800" },
    { id: "completed", title: "Completed", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", borderColor: "border-emerald-200 dark:border-emerald-800" }
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/60 dark:ring-slate-800/60 rounded-[2rem] shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
            <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Task Board
          </h2>
        </div>
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

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 h-full min-h-0">
        {loading ? (
          <div className="flex w-full items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></div>
                <div className="relative inline-flex h-4 w-4 rounded-full bg-indigo-500"></div>
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Loading board...</span>
            </div>
          </div>
        ) : (
          columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            
            return (
              <div 
                key={col.id}
                className={`flex flex-col w-80 shrink-0 rounded-2xl border ${col.borderColor} ${col.bgColor} p-4`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{col.title}</h3>
                  <span className="bg-white dark:bg-slate-800 text-slate-500 text-xs px-2.5 py-1 rounded-full shadow-sm font-medium">
                    {colTasks.length}
                  </span>
                </div>
                
                <div className="flex flex-col gap-4 overflow-y-auto min-h-[100px] h-full pb-2 pr-1">
                  {colTasks.map(task => (
                    <Card 
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing bg-white/90 dark:bg-slate-900/90 backdrop-blur group"
                    >
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-2">
                            <GripVertical className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <h4 className="font-medium text-sm leading-tight text-slate-800 dark:text-slate-200 line-clamp-2">
                              {task.title}
                            </h4>
                          </div>
                          {userRole !== "employee" && (
                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsModalOpen(true); }}
                                className="text-slate-400 hover:text-indigo-600 p-1"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteId(task.id); }}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {task.description || "No description provided."}
                        </p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize border ${
                            task.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {task.priority || 'Medium'}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setViewingTask(task); setIsDetailModalOpen(true); }}
                              className="text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/30 p-1.5 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500">
                      <span className="text-sm">Drop here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
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
