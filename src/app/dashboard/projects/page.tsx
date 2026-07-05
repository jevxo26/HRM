"use client";

import React, { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash2, Search, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProjectFormModal } from "./ProjectFormModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  stats?: {
    totalTasks: number;
    pendingTasks: number;
    successTasks: number;
    activeUsers: number;
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [userRole, setUserRole] = useState<string>("employee");

  const fetchProjects = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const [projRes, authRes] = await Promise.all([
        fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setUserRole(authData.data?.role || authData.role || 'employee');
      }

      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const executeDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Project deleted successfully");
        fetchProjects();
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("An error occurred");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        {userRole !== "employee" && (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/60 dark:ring-slate-800/60 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
            <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Project Overview
          </h2>
        </div>
        <div className="w-full sm:w-80 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
          <Input 
            placeholder="Search projects by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-11 bg-white/60 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-2xl shadow-sm hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-300"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/60 dark:ring-slate-800/60 rounded-2xl animate-pulse">
              <CardContent className="p-6 h-[250px] flex flex-col">
                <div className="flex gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                </div>
                <div className="flex gap-2 mb-6">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
                <div className="mt-auto space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-8" />
                  </div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/60 dark:ring-slate-800/60 rounded-[2rem]">
          <LayoutDashboard className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
          <span className="text-xl font-medium text-slate-600 dark:text-slate-400">No projects found</span>
          <span className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search criteria</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/60 dark:ring-slate-800/60 rounded-2xl overflow-hidden hover:-translate-y-1"
            >
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg shadow-inner">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg line-clamp-1">{project.name}</h3>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">ID: #{project.id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                  
                  {userRole !== "employee" && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(project.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-2 min-h-[2.5rem]">
                  {project.description}
                </p>
                
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    {project.stats?.totalTasks || 0} Total
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-100 dark:border-amber-500/20 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                    {project.stats?.pendingTasks || 0} Pending
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Completion</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden ring-1 ring-inset ring-slate-200/50 dark:ring-slate-700/50">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-1000 ease-out relative overflow-hidden" 
                      style={{ width: `${project.progress || 0}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg) translateX(-150%)' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <ProjectFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        project={editingProject}
        onSuccess={fetchProjects}
      />
    
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={executeDelete} 
        title="Confirm Deletion" 
        description="Are you sure you want to delete this project?" 
      />
    </div>
  );
}
