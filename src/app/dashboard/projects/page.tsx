"use client";

import React, { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
        setUserRole(authData.role);
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

      <Card className="border-0 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/60 dark:ring-slate-800/60 overflow-hidden rounded-[2rem]">
        <CardHeader className="px-8 pb-6 pt-8 border-b border-slate-200/40 dark:border-slate-800/60 bg-white/20 dark:bg-slate-900/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3 animate-gradient-x">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              Project Overview
            </CardTitle>
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
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-800/60 backdrop-blur-md">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-8 uppercase tracking-wider text-xs">Project Name</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">Description</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">Progress</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">Tasks</TableHead>
                  {userRole !== "employee" && <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 py-5 px-8 uppercase tracking-wider text-xs">Actions</TableHead>}
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
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Loading amazing projects...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <LayoutDashboard className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                        <span className="text-base font-medium text-slate-600 dark:text-slate-400">No projects found</span>
                        <span className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search criteria</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project, index) => (
                    <TableRow 
                      key={project.id} 
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      className={`group cursor-pointer border-b border-slate-100/50 dark:border-slate-800/40 transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/20 dark:bg-slate-900/20'}`}
                    >
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm shadow-inner">
                            {project.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-base">{project.name}</span>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">ID: #{project.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 max-w-[280px]">
                        <p className="truncate text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{project.description}</p>
                      </TableCell>
                      <TableCell className="px-6 py-5 w-56">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-slate-500 dark:text-slate-400">Completion</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{project.progress || 0}%</span>
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
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 shadow-sm transition-transform hover:scale-105">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            {project.stats?.totalTasks || 0} Total
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-100 dark:border-amber-500/20 shadow-sm transition-transform hover:scale-105">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                            {project.stats?.pendingTasks || 0} Pending
                          </span>
                        </div>
                      </TableCell>
                      {userRole !== "employee" && (
                        <TableCell className="text-right px-8 py-5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-all shadow-sm hover:shadow"
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
                              className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-all shadow-sm hover:shadow"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(project.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
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
