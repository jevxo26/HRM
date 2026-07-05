"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Select from "react-select";

interface AttendanceRecord {
  id: number;
  userId?: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

interface User {
  id: number;
  name: string;
}

interface AttendanceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: AttendanceRecord | null;
  onSuccess: () => void;
  userRole?: string;
}

export function AttendanceFormModal({ open, onOpenChange, record, onSuccess, userRole }: AttendanceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    userId: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "present",
  });

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) setUsers(await res.json());
        } catch (error) {
          console.error("Failed to fetch users", error);
        }
      };
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (record) {
      setFormData({
        userId: record.userId?.toString() || "",
        date: record.date ? (() => {
          const d = new Date(record.date);
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        })() : "",
        checkIn: record.checkIn ? (() => {
          const d = new Date(record.checkIn);
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        })() : "",
        checkOut: record.checkOut ? (() => {
          const d = new Date(record.checkOut);
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        })() : "",
        status: record.status || "present",
      });
    } else {
      setFormData({
        userId: "",
        date: (() => {
          const d = new Date();
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        })(),
        checkIn: "",
        checkOut: "",
        status: "present",
      });
    }
  }, [record, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const isEdit = !!record;
      const url = isEdit ? `/api/attendance/${record.id}` : "/api/attendance/manual";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        userId: parseInt(formData.userId, 10),
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        checkIn: formData.checkIn ? new Date(formData.checkIn).toISOString() : null,
        checkOut: formData.checkOut ? new Date(formData.checkOut).toISOString() : null,
        status: formData.status,
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
        throw new Error(errorData.error || errorData.message || "Failed to save attendance");
      }

      toast.success(isEdit ? "Attendance updated successfully" : "Attendance created successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] w-full">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{record ? "Edit Attendance" : "Add Attendance"}</DialogTitle>
            <DialogDescription>
              {record ? "Make changes to the attendance record." : "Enter the details for a new attendance record."}
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkIn">Check In Time</Label>
              <Input
                id="checkIn"
                type="datetime-local"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Check Out Time</Label>
              <Input
                id="checkOut"
                type="datetime-local"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              />
            </div>

            {userRole !== 'employee' && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  options={[
                    { value: "present", label: "Present" },
                    { value: "absent", label: "Absent" },
                    { value: "leave", label: "Leave" },
                  ]}
                  value={{ value: formData.status, label: formData.status.replace(/\b\w/g, l => l.toUpperCase()) }}
                  onChange={(option) => setFormData({ ...formData, status: option?.value || "present" })}
                  className="text-sm"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.userId}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
