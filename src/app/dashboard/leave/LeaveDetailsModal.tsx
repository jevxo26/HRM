"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  dayType?: string;
  createdAt?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface LeaveDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: LeaveRequest | null;
}

export function LeaveDetailsModal({ open, onOpenChange, leave }: LeaveDetailsModalProps) {
  if (!leave) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
          <DialogDescription>
            Detailed information about the leave request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          {leave.user && (
            <div className="grid grid-cols-3 gap-2 border-b pb-2">
              <span className="font-medium text-slate-500 dark:text-slate-400">Employee:</span>
              <span className="col-span-2 font-semibold">{leave.user.name} ({leave.user.email})</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 border-b pb-2">
            <span className="font-medium text-slate-500 dark:text-slate-400">Type:</span>
            <span className="col-span-2 capitalize font-semibold">{leave.type}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b pb-2">
            <span className="font-medium text-slate-500 dark:text-slate-400">Duration:</span>
            <span className="col-span-2">
              {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b pb-2">
            <span className="font-medium text-slate-500 dark:text-slate-400">Day Type:</span>
            <span className="col-span-2 capitalize">{(leave.dayType || "Full Day").replace("_", " ")}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b pb-2">
            <span className="font-medium text-slate-500 dark:text-slate-400">Reason:</span>
            <span className="col-span-2">{leave.reason || "No reason provided"}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b pb-2">
            <span className="font-medium text-slate-500 dark:text-slate-400">Status:</span>
            <span className="col-span-2 capitalize font-semibold flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                leave.status === 'approved' ? 'bg-green-500' :
                leave.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
              }`}></div>
              {leave.status}
            </span>
          </div>
          {leave.createdAt && (
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium text-slate-500 dark:text-slate-400">Applied On:</span>
              <span className="col-span-2">
                {new Date(leave.createdAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
