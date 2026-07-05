"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash2, Search, CalendarOff, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LeaveFormModal } from "./LeaveFormModal";
import { LeaveDetailsModal } from "./LeaveDetailsModal";
import { toast } from "sonner";

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

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [detailsRequest, setDetailsRequest] = useState<LeaveRequest | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const fetchLeaves = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/leaves/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const response = await res.json();
        const data = Array.isArray(response) ? response : response.data || [];
        // Fallback to formatting properly if needed
        const mappedData = data.map((d: any) => ({
          ...d,
          type: d.leaveType?.name || d.type || "Leave",
        }));
        setRequests(mappedData);
      } else {
        // if my-requests fails, try /api/leaves/all for admin
        const resAll = await fetch("/api/leaves/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resAll.ok) {
          const responseAll = await resAll.json();
          const dataAll = Array.isArray(responseAll) ? responseAll : responseAll.data || [];
          const mappedData = dataAll.map((d: any) => ({
            ...d,
            type: d.leaveType?.name || d.type || "Leave",
          }));
          setRequests(mappedData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decoded.role || "");
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
    fetchLeaves();
  }, []);

  const handleDelete = async (id: number) => {
    // Only implemented if there's a delete route, which we don't know exists, so skip for now or implement gracefully
    toast.error("Delete functionality for leaves is usually disabled.");
  };

  const filteredRequests = requests.filter(r => 
    (r.type || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.status || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Leave</h1>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => {
            setEditingRequest(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Apply for Leave
        </Button>
      </div>

      <Card className="border-0 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/60 dark:ring-slate-800/60 overflow-hidden rounded-[2rem]">
        <CardHeader className="px-8 pb-6 pt-8 border-b border-slate-200/40 dark:border-slate-800/60 bg-white/20 dark:bg-slate-900/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3 animate-gradient-x">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                <CalendarOff className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              Leave Requests
            </CardTitle>
            <div className="w-full sm:w-80 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
              <Input 
                placeholder="Search by type or status..." 
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
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-8 uppercase tracking-wider text-xs">Type</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">Start Date</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">End Date</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 py-5 px-8 uppercase tracking-wider text-xs">Actions</TableHead>
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
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Loading requests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CalendarOff className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                        <span className="text-base font-medium text-slate-600 dark:text-slate-400">No leave requests found</span>
                        <span className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search criteria</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req, index) => (
                    <TableRow 
                      key={req.id}
                      className={`group border-b border-slate-100/50 dark:border-slate-800/40 transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/20 dark:bg-slate-900/20'}`}
                    >
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm shadow-inner">
                            {req.type.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-base capitalize">{req.type}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-slate-600 dark:text-slate-300">{new Date(req.startDate).toLocaleDateString()}</TableCell>
                      <TableCell className="px-6 py-5 text-slate-600 dark:text-slate-300">{new Date(req.endDate).toLocaleDateString()}</TableCell>
                      <TableCell className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize border shadow-sm ${
                          req.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20' :
                          req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' :
                          'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'approved' ? 'bg-green-500' : req.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-8 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="View Details"
                            className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-all shadow-sm hover:shadow"
                            onClick={() => {
                              setDetailsRequest(req);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {['cto', 'ceo', 'teamlead', 'hr', 'founder', 'admin'].includes(userRole) && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Update Status"
                              className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-all shadow-sm hover:shadow"
                              onClick={() => {
                                setEditingRequest(req);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <LeaveFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        leave={editingRequest}
        onSuccess={fetchLeaves}
      />

      <LeaveDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        leave={detailsRequest}
      />
    </div>
  );
}
