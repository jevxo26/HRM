"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LeaveTypeFormModal } from "./LeaveTypeFormModal";

interface LeaveType {
  id: number;
  name: string;
  description: string | null;
  defaultDays: number | null;
}

export default function LeaveTypePage() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);

  const fetchTypes = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/leaves/types", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const response = await res.json();
        setTypes(Array.isArray(response) ? response : response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch leave types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const filteredTypes = types.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Leave Types</h1>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => {
            setEditingType(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Leave Type
        </Button>
      </div>

      <Card className="border-0 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/60 dark:ring-slate-800/60 overflow-hidden rounded-[2rem]">
        <CardHeader className="px-8 pb-6 pt-8 border-b border-slate-200/40 dark:border-slate-800/60 bg-white/20 dark:bg-slate-900/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3 animate-gradient-x">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              Leave Types
            </CardTitle>
            <div className="w-full sm:w-80 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
              <Input 
                placeholder="Search leave types..." 
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
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-8 uppercase tracking-wider text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs">Description</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-5 px-6 uppercase tracking-wider text-xs text-center">Default Days</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 py-5 px-8 uppercase tracking-wider text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="relative flex h-8 w-8 items-center justify-center">
                          <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></div>
                          <div className="relative inline-flex h-4 w-4 rounded-full bg-indigo-500"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Loading types...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                        <span className="text-base font-medium text-slate-600 dark:text-slate-400">No leave types found</span>
                        <span className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search criteria</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTypes.map((type, index) => (
                    <TableRow 
                      key={type.id}
                      className={`group border-b border-slate-100/50 dark:border-slate-800/40 transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/20 dark:bg-slate-900/20'}`}
                    >
                      <TableCell className="px-8 py-5">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-base">{type.name}</span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-slate-600 dark:text-slate-300">
                        {type.description || <span className="text-slate-400 italic">No description</span>}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-500/20">
                          {type.defaultDays ?? '-'} days
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-8 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Edit Type"
                            className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-all shadow-sm hover:shadow"
                            onClick={() => {
                              setEditingType(type);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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
      
      <LeaveTypeFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        leaveType={editingType}
        onSuccess={fetchTypes}
      />
    </div>
  );
}
