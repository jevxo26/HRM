import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle2, User, LayoutList } from "lucide-react";

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

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function TaskDetailModal({ open, onOpenChange, task }: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden rounded-[2rem] p-0 border-0 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/60 dark:ring-slate-800/60">
        <DialogHeader className="px-8 pt-8 pb-6 bg-white/20 dark:bg-slate-900/20 border-b border-slate-200/40 dark:border-slate-800/60">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <LayoutList className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Task Details
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{task.title}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{task.description || "No description provided."}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700">
              <CheckCircle2 className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <Badge variant="outline" className="mt-1 capitalize">{task.status.replace("_", " ")}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700">
              <AlertCircle className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Priority</p>
                <Badge variant="outline" className="mt-1 capitalize">{task.priority || "Medium"}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Due Date</p>
                <p className="font-medium mt-1">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Assignee ID</p>
                <p className="font-medium mt-1">{task.userId || 'Unassigned'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
