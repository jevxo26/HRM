"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Select from "react-select";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  projectId: number;
  userId?: number;
  priority?: string;
  dueDate?: string;
}

interface Project {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSuccess: () => void;
}

export function TaskFormModal({ open, onOpenChange, task, onSuccess }: TaskFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    projectId: "",
    userId: "",
  });

  useEffect(() => {
    if (open) {
      const fetchDeps = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserRole(payload.role || "");
        } catch (e) {}

        try {
          const [projRes, userRes] = await Promise.all([
            fetch("/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (projRes.ok) setProjects(await projRes.json());
          if (userRes.ok) {
            const data = await userRes.json();
            setUsers(Array.isArray(data) ? data : data.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch dependencies", error);
        }
      };
      fetchDeps();
    }
  }, [open]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
        projectId: task.projectId?.toString() || "",
        userId: task.userId?.toString() || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: "",
        projectId: "",
        userId: "",
      });
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const isEdit = !!task;
      const url = isEdit ? `/api/tasks/${task.id}` : "/api/tasks";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        projectId: parseInt(formData.projectId, 10),
        userId: formData.userId ? parseInt(formData.userId, 10) : null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save task");
      }

      toast.success(isEdit ? "Task updated successfully" : "Task created successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!task;
  const isEmployeeEdit = isEdit && userRole === "employee";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
            <DialogDescription>
              {task ? "Make changes to the task here." : "Enter the details for the new task."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!isEmployeeEdit && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                ]}
                value={{ value: formData.status, label: formData.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) }}
                onChange={(option) => setFormData({ ...formData, status: option?.value || "pending" })}
                className="text-sm"
              />
            </div>
            {!isEmployeeEdit && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                      ]}
                      value={{ value: formData.priority, label: formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1) }}
                      onChange={(option) => setFormData({ ...formData, priority: option?.value || "medium" })}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date & Time</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project</Label>
                  <Select
                    options={projects.map(p => ({ value: p.id.toString(), label: p.name }))}
                    value={formData.projectId ? { value: formData.projectId, label: projects.find(p => p.id.toString() === formData.projectId)?.name } : null}
                    onChange={(option) => setFormData({ ...formData, projectId: option?.value || "" })}
                    placeholder="Select a project"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userId">Assignee (Optional)</Label>
                  <Select
                    options={[{ value: "", label: "Unassigned" }, ...users.map(u => ({ value: u.id.toString(), label: u.name }))]}
                    value={formData.userId ? { value: formData.userId, label: users.find(u => u.id.toString() === formData.userId)?.name } : { value: "", label: "Unassigned" }}
                    onChange={(option) => setFormData({ ...formData, userId: option?.value || "" })}
                    placeholder="Select an assignee"
                    className="text-sm"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.projectId}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
