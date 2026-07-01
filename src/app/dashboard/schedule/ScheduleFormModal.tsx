"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Select from "react-select";

interface Schedule {
  id: number;
  userId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  user?: { name: string };
}

interface User {
  id: number;
  name: string;
}

interface ScheduleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Schedule | null;
  onSuccess: () => void;
  userRole?: string;
}

export function ScheduleFormModal({ open, onOpenChange, schedule, onSuccess, userRole }: ScheduleFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    userId: "",
    dayOfWeek: "Monday",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (open && userRole !== 'employee') {
      const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const result = await res.json();
            setUsers(Array.isArray(result) ? result : result.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch users", error);
        }
      };
      fetchUsers();
    }
  }, [open, userRole]);

  useEffect(() => {
    if (schedule) {
      setFormData({
        userId: schedule.userId?.toString() || "",
        dayOfWeek: schedule.dayOfWeek || "Monday",
        startTime: schedule.startTime || "",
        endTime: schedule.endTime || "",
      });
    } else {
      setFormData({
        userId: "",
        dayOfWeek: "Monday",
        startTime: "",
        endTime: "",
      });
    }
  }, [schedule, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const isEdit = !!schedule;
      const url = isEdit ? `/api/schedules/${schedule.id}` : "/api/schedules";
      const method = isEdit ? "PUT" : "POST";

      const payload: any = {
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      if (userRole !== 'employee' && formData.userId) {
        payload.userId = parseInt(formData.userId, 10);
      }

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
        throw new Error(errorData.message || "Failed to save schedule");
      }

      toast.success(isEdit ? "Schedule updated successfully" : "Schedule created successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{schedule ? "Edit Schedule" : "Add Schedule"}</DialogTitle>
            <DialogDescription>
              {schedule ? "Make changes to the schedule here." : "Enter the details for the new schedule."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {userRole !== 'employee' && (
              <div className="space-y-2">
                <Label htmlFor="userId">User</Label>
                <Select
                  options={users.map(u => ({ value: u.id.toString(), label: u.name }))}
                  value={formData.userId ? { value: formData.userId, label: users.find(u => u.id.toString() === formData.userId)?.name } : null}
                  onChange={(option) => setFormData({ ...formData, userId: option?.value || "" })}
                  placeholder="Select a user"
                  className="text-sm"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select
                options={days.map(day => ({ value: day, label: day }))}
                value={{ value: formData.dayOfWeek, label: formData.dayOfWeek }}
                onChange={(option) => setFormData({ ...formData, dayOfWeek: option?.value || "Monday" })}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
