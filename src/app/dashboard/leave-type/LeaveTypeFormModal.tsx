"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LeaveTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: any;
  onSuccess: () => void;
}

export function LeaveTypeFormModal({ open, onOpenChange, leaveType, onSuccess }: LeaveTypeFormModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultDays: "",
  });

  useEffect(() => {
    if (leaveType) {
      setFormData({
        name: leaveType.name || "",
        description: leaveType.description || "",
        defaultDays: leaveType.defaultDays ? leaveType.defaultDays.toString() : "",
      });
    } else {
      setFormData({ name: "", description: "", defaultDays: "" });
    }
  }, [leaveType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const url = leaveType ? `/api/leaves/types/${leaveType.id}` : "/api/leaves/types";
      const method = leaveType ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          defaultDays: formData.defaultDays ? parseInt(formData.defaultDays) : null,
        }),
      });

      if (res.ok) {
        toast.success(leaveType ? "Leave type updated successfully" : "Leave type created successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await res.json();
        toast.error(error.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save leave type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-0 shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {leaveType ? "Edit Leave Type" : "Create Leave Type"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">Name</Label>
            <Input 
              id="name" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="h-11 bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60 rounded-xl focus-visible:ring-indigo-500/50"
              placeholder="e.g. Casual Leave"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultDays" className="text-slate-700 dark:text-slate-300 font-medium">Default Days (Optional)</Label>
            <Input 
              id="defaultDays" 
              type="number"
              min="0"
              value={formData.defaultDays}
              onChange={(e) => setFormData({...formData, defaultDays: e.target.value})}
              className="h-11 bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60 rounded-xl focus-visible:ring-indigo-500/50"
              placeholder="e.g. 14"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-medium">Description (Optional)</Label>
            <textarea 
              id="description" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="flex min-h-[100px] w-full resize-none bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Brief description of this leave type..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 dark:border-slate-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20"
            >
              {loading ? "Saving..." : "Save Leave Type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
