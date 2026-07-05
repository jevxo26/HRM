"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Link as LinkIcon, FileText, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Profile {
  id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Team {
  id: number;
  name: string;
  description: string;
  profiles?: Profile[];
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [documentLink, setDocumentLink] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/team/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch team details");
        const data = await res.json();
        setTeam(data);
      } catch (error) {
        toast.error("Could not load team details");
        router.push("/dashboard/team");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchTeam();
    }
  }, [params.id, router]);

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required.");
      return;
    }

    if (!team) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/team/${team.id}/bulk-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject, message, link, documentLink })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send emails");
      }

      toast.success("Bulk email queued successfully!");
      setSubject("");
      setMessage("");
      setLink("");
      setDocumentLink("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!team) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/team">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{team.name}</h1>
          <p className="text-slate-500 dark:text-slate-400">{team.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Members List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-indigo-500" />
            Team Members ({team.profiles?.length || 0})
          </h3>
          
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {team.profiles && team.profiles.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                  {team.profiles.map((profile) => (
                    <div key={profile.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg shrink-0">
                        {profile.user?.name.substring(0, 2).toUpperCase() || "U"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-base">{profile.user?.name}</p>
                        <p className="text-sm text-slate-500 truncate">{profile.user?.email || "No email provided"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[200px]">
                  <UserCircle className="h-12 w-12 mb-3 text-slate-300" />
                  <p>No members assigned to this team yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bulk Email Form */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Send className="h-6 w-6 text-indigo-500" />
            Send Bulk Email
          </h3>
          
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Subject <span className="text-rose-500">*</span></label>
                <Input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="e.g. Important Project Update"
                  className="bg-slate-50 dark:bg-slate-900/50 h-11"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Message <span className="text-rose-500">*</span></label>
                <Textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Type your message here..."
                  className="h-40 bg-slate-50 dark:bg-slate-900/50 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Action Link (Optional)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={link} 
                    onChange={(e) => setLink(e.target.value)} 
                    placeholder="https://example.com/action"
                    className="pl-10 bg-slate-50 dark:bg-slate-900/50 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Document Link (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={documentLink} 
                    onChange={(e) => setDocumentLink(e.target.value)} 
                    placeholder="https://docs.google.com/..."
                    className="pl-10 bg-slate-50 dark:bg-slate-900/50 h-11"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSendEmail} 
                disabled={isSending || !team.profiles?.length}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base mt-4"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Sending Emails...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" /> Send to {team.profiles?.length || 0} Members
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
