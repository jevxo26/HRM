"use client";

import React, { useEffect, useState, useRef } from "react";
import { UserCircle, Save, Loader2, Upload, Briefcase, Mail, Phone, MapPin, Building, Activity, ShieldCheck, CheckCircle2, UsersRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [userRole, setUserRole] = useState<string>("employee");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const profileData = data.data || data;
        setProfile(profileData || {});
        
        const userRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          const actualUserData = userData.data || userData;
          setUserRole(actualUserData.role || "employee");
        }
      } else {
        toast.error("Failed to fetch profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload/single", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const fileUrl = data.url || data.filePath || (data.file && data.file.path) || (data.data && data.data.url);
        if (fileUrl) {
          setProfile((prev: any) => ({ ...prev, profilePicture: fileUrl }));
          toast.success("Picture uploaded! Click 'Save Changes' to update your profile.");
        } else {
          toast.success("Uploaded, but couldn't resolve URL.");
        }
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full border-4 border-indigo-200/50 border-t-indigo-600 animate-spin"></div>
          <Loader2 className="h-6 w-6 text-indigo-600" />
        </div>
      </div>
    );
  }

  const isAdmin = userRole === "admin";

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center"
            >
              {profile?.profilePicture ? (
                <img src={profile.profilePicture.startsWith('/') ? profile.profilePicture : `/${profile.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={64} className="text-indigo-300" />
              )}
              
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-white mb-1" />
                    <span className="text-white text-xs font-medium">Update Photo</span>
                  </>
                )}
              </div>
            </motion.div>
            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="flex-1 text-center md:text-left mt-2 md:mt-4">
            <h1 className="text-3xl font-extrabold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
              {profile?.name || "My Profile"}
            </h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
              <Briefcase size={16} className="text-indigo-500" /> 
              {profile?.designation || "Employee"} • {profile?.department || "General"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100/80 text-green-700 text-xs font-semibold shadow-sm border border-green-200/50">
                <CheckCircle2 size={12} /> Active Status
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold shadow-sm border border-indigo-200/50 uppercase tracking-wider">
                <ShieldCheck size={12} /> {userRole}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Personal Details Card */}
          <motion.div variants={itemVariants} className="group flex flex-col rounded-3xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
            <div className="px-8 py-6 border-b border-white/30 bg-white/20">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <UserCircle className="text-indigo-500" size={20} />
                Personal & General Details
              </h2>
            </div>
            <div className="p-8 space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Gender</Label>
                  <Input name="gender" value={profile?.gender || ""} onChange={handleChange} placeholder="e.g. Male/Female" 
                    className="bg-white/50 border-white/50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-400/20 transition-all rounded-xl shadow-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Blood Group</Label>
                  <Input name="bloodGroup" value={profile?.bloodGroup || ""} onChange={handleChange} placeholder="e.g. O+" 
                    className="bg-white/50 border-white/50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-400/20 transition-all rounded-xl shadow-sm" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium flex items-center gap-2"><Phone size={14} className="text-slate-400" /> Mobile Number</Label>
                <Input name="mobileNumber" value={profile?.mobileNumber || ""} onChange={handleChange} placeholder="01XXX-XXXXXX" 
                  className="bg-white/50 border-white/50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-400/20 transition-all rounded-xl shadow-sm" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> Present Address</Label>
                <Input name="presentAddress" value={profile?.presentAddress || ""} onChange={handleChange} placeholder="123 Street, City"
                  className="bg-white/50 border-white/50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-400/20 transition-all rounded-xl shadow-sm" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium flex items-center gap-2"><Building size={14} className="text-slate-400" /> Department</Label>
                <Input name="department" value={profile?.department || ""} onChange={handleChange} placeholder="e.g. Engineering" 
                  className="bg-white/50 border-white/50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-400/20 transition-all rounded-xl shadow-sm" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium flex items-center gap-2"><UsersRound size={14} className="text-slate-400" /> Team</Label>
                <Input value={profile?.team?.name || "Unassigned"} readOnly
                  className="bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed transition-all rounded-xl shadow-sm focus-visible:ring-0" />
              </div>
            </div>
          </motion.div>

          {/* Employment & Salary Card */}
          <motion.div variants={itemVariants} className="group flex flex-col rounded-3xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
            <div className="px-8 py-6 border-b border-white/30 bg-white/20">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="text-purple-500" size={20} />
                Employment & Salary
                {!isAdmin && <span className="ml-auto text-xs px-2 py-1 bg-slate-200/50 text-slate-500 rounded-md font-medium uppercase tracking-widest">Read Only</span>}
              </h2>
            </div>
            <div className="p-8 space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Designation</Label>
                  <Input 
                    name="designation" value={profile?.designation || ""} onChange={handleChange} readOnly={!isAdmin} 
                    className={`transition-all rounded-xl shadow-sm ${!isAdmin ? "bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed focus-visible:ring-0" : "bg-white/50 border-white/50 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20"}`}
                    placeholder="e.g. Software Engineer" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Employment Type</Label>
                  <Input 
                    name="employmentType" value={profile?.employmentType || ""} onChange={handleChange} readOnly={!isAdmin} 
                    className={`transition-all rounded-xl shadow-sm ${!isAdmin ? "bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed focus-visible:ring-0" : "bg-white/50 border-white/50 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20"}`}
                    placeholder="e.g. FULLTIME" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-medium flex items-center gap-2">Basic Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <Input 
                    type="number" name="basicSalary" value={profile?.basicSalary || ""} onChange={handleChange} readOnly={!isAdmin} 
                    className={`pl-8 transition-all rounded-xl shadow-sm ${!isAdmin ? "bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed focus-visible:ring-0" : "bg-white/50 border-white/50 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20"}`}
                    placeholder="0.00" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-600 font-medium flex items-center gap-2">Gross Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <Input 
                    type="number" name="grossSalary" value={profile?.grossSalary || ""} onChange={handleChange} readOnly={!isAdmin} 
                    className={`pl-8 transition-all rounded-xl shadow-sm ${!isAdmin ? "bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed focus-visible:ring-0" : "bg-white/50 border-white/50 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20"}`}
                    placeholder="0.00" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={saving} 
            className="relative h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95 text-base font-semibold group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <div className="relative flex items-center">
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {saving ? "Saving Changes..." : "Save Changes"}
            </div>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
