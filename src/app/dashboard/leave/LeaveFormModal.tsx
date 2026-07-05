"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Select from "react-select";

interface LeaveRequest {
  id: number;
  type: string;
  leaveTypeId?: number;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  dayType?: string;
}

interface LeaveType {
  id: number;
  name: string;
}

interface LeaveFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave?: LeaveRequest | null;
  onSuccess: () => void;
}

export function LeaveFormModal({ open, onOpenChange, leave, onSuccess }: LeaveFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    dayType: "full_day",
    reason: "",
    status: "pending",
  });

  useEffect(() => {
    if (open) {
      const fetchLeaveTypes = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const res = await fetch("/api/leaves/types", { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const result = await res.json();
            setLeaveTypes(Array.isArray(result) ? result : result.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch leave types", error);
        }
      };
      fetchLeaveTypes();
    }
  }, [open]);

  useEffect(() => {
    if (leave) {
      setFormData({
        leaveTypeId: leave.leaveTypeId?.toString() || "",
        startDate: leave.startDate ? (() => {
          const d = new Date(leave.startDate);
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        })() : "",
        endDate: leave.endDate ? (() => {
          const d = new Date(leave.endDate);
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        })() : "",
        dayType: leave.dayType || "full_day",
        reason: leave.reason || "",
        status: leave.status || "pending",
      });
    } else {
      setFormData({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        dayType: "full_day",
        reason: "",
        status: "pending",
      });
    }
  }, [leave, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const isEdit = !!leave;
      // If edit, it's just updating status, if create, it's applying
      const url = isEdit ? `/api/leaves/${leave.id}/status` : "/api/leaves/apply";
      const method = isEdit ? "PUT" : "POST";

      const payload = isEdit 
        ? { status: formData.status } 
        : {
            leaveTypeId: parseInt(formData.leaveTypeId, 10),
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            dayType: formData.dayType,
            reason: formData.reason,
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
        throw new Error(errorData.error || errorData.message || "Failed to save leave request");
      }

      toast.success(isEdit ? "Leave status updated successfully" : "Leave requested successfully");
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
      <DialogContent className="sm:max-w-[500px] w-full">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{leave ? "Update Leave Status" : "Apply for Leave"}</DialogTitle>
            <DialogDescription>
              {leave ? "Update the status of this leave request." : "Fill in the details for your leave application."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!leave && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="leaveTypeId">Leave Type</Label>
                  <Select
                    options={leaveTypes.map(lt => ({ value: lt.id.toString(), label: lt.name }))}
                    value={formData.leaveTypeId ? { value: formData.leaveTypeId, label: leaveTypes.find(lt => lt.id.toString() === formData.leaveTypeId)?.name } : null}
                    onChange={(option) => setFormData({ ...formData, leaveTypeId: option?.value || "" })}
                    placeholder="Select type"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayType">Day Type</Label>
                  <Select
                    options={[
                      { value: "full_day", label: "Full Day" },
                      { value: "half_day", label: "Half Day" },
                    ]}
                    value={{ value: formData.dayType, label: formData.dayType === "half_day" ? "Half Day" : "Full Day" }}
                    onChange={(option) => setFormData({ ...formData, dayType: option?.value || "full_day" })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
              </>
            )}

            {leave && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                  value={{ value: formData.status, label: formData.status.replace(/\b\w/g, l => l.toUpperCase()) }}
                  onChange={(option) => setFormData({ ...formData, status: option?.value || "pending" })}
                  className="text-sm"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!leave && !formData.leaveTypeId)}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
