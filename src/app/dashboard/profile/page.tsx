"use client";

import React, { useEffect, useState, useRef } from "react";
import { UserCircle, Save, Loader2, Upload, Briefcase, Mail, Phone, MapPin, Building, Activity, ShieldCheck, CheckCircle2, UsersRound, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState("personal");
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
        
        // Format dates to YYYY-MM-DD for date inputs
        if (profileData.dateOfBirth) profileData.dateOfBirth = profileData.dateOfBirth.split('T')[0];
        if (profileData.joiningDate) profileData.joiningDate = profileData.joiningDate.split('T')[0];
        if (profileData.confirmationDate) profileData.confirmationDate = profileData.confirmationDate.split('T')[0];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Auto-parse numbers for salary fields
    const numberFields = ['basicSalary', 'allowances', 'grossSalary'];
    if (numberFields.includes(name)) {
      setProfile((prev: any) => ({ ...prev, [name]: value ? parseFloat(value) : null }));
    } else {
      setProfile((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Not authenticated");

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
          toast.success("Picture uploaded! Click 'Save Changes' to apply.");
        } else {
          toast.success("Uploaded, but couldn't resolve URL.");
        }
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Not authenticated");

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
  const inputClass = "bg-white/50 border-white/50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-400/20 transition-all rounded-xl shadow-sm";
  const readOnlyClass = "bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed transition-all rounded-xl shadow-sm focus-visible:ring-0";

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-8 pb-12 font-sans">
      
      {/* Header Profile Summary */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm p-8">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture.startsWith('/') || profile.profilePicture.startsWith('http') ? profile.profilePicture : `/${profile.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={64} className="text-indigo-300" />
              )}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                {uploading ? <Loader2 className="h-8 w-8 text-white animate-spin" /> : (
                  <><Upload className="h-6 w-6 text-white mb-1" /><span className="text-white text-xs font-medium">Update</span></>
                )}
              </div>
            </motion.div>
            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="flex-1 text-center md:text-left mt-2 md:mt-4">
            <h1 className="text-3xl font-extrabold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
              {profile?.user?.name || profile?.name || "My Profile"}
            </h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
              <Briefcase size={16} className="text-indigo-500" /> 
              {profile?.designation || "Employee"} • {profile?.department || "General"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100/80 text-green-700 text-xs font-semibold shadow-sm border border-green-200/50">
                <CheckCircle2 size={12} /> {profile?.employmentStatus || 'Active Status'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold shadow-sm border border-indigo-200/50 uppercase tracking-wider">
                <ShieldCheck size={12} /> {userRole}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div variants={itemVariants} className="flex overflow-x-auto gap-2 p-1.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm w-fit">
        {[
          { id: 'personal', label: 'Personal', icon: UserCircle },
          { id: 'contact', label: 'Contact', icon: Phone },
          { id: 'employment', label: 'Employment', icon: Briefcase },
          { id: 'payroll', label: 'Payroll', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600'}`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? "text-indigo-200" : "text-slate-400"} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8 relative">
        {/* PERSONAL DETAILS TAB */}
        {activeTab === 'personal' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-sm">
            <h2 className="col-span-full text-xl font-bold text-slate-800 mb-2 border-b border-white/50 pb-4">Personal Information</h2>
            
            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Gender</Label>
              <select name="gender" value={profile?.gender || ""} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Date of Birth</Label>
              <Input type="date" name="dateOfBirth" value={profile?.dateOfBirth || ""} onChange={handleChange} className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Blood Group</Label>
              <select name="bloodGroup" value={profile?.bloodGroup || ""} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Marital Status</Label>
              <select name="maritalStatus" value={profile?.maritalStatus || ""} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}>
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Nationality</Label>
              <Input name="nationality" value={profile?.nationality || ""} onChange={handleChange} placeholder="e.g. Bangladeshi" className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Religion</Label>
              <Input name="religion" value={profile?.religion || ""} onChange={handleChange} placeholder="e.g. Islam" className={inputClass} />
            </div>

            <div className="space-y-2 col-span-full">
              <Label className="text-slate-600 font-medium">NID / Passport Number</Label>
              <Input name="nidOrPassport" value={profile?.nidOrPassport || ""} onChange={handleChange} placeholder="Identification Number" className={inputClass} />
            </div>
          </motion.div>
        )}

        {/* CONTACT DETAILS TAB */}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-sm">
            <h2 className="col-span-full text-xl font-bold text-slate-800 mb-2 border-b border-white/50 pb-4">Contact Information</h2>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium flex items-center gap-2"><Mail size={14} className="text-slate-400"/> Personal Email</Label>
              <Input type="email" name="personalEmail" value={profile?.personalEmail || ""} onChange={handleChange} placeholder="example@gmail.com" className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium flex items-center gap-2"><Building size={14} className="text-slate-400"/> Official Email</Label>
              <Input type="email" name="officialEmail" value={profile?.officialEmail || ""} onChange={handleChange} placeholder="work@company.com" className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium flex items-center gap-2"><Phone size={14} className="text-slate-400"/> Mobile Number</Label>
              <Input type="tel" name="mobileNumber" value={profile?.mobileNumber || ""} onChange={handleChange} placeholder="+8801..." className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium flex items-center gap-2"><Activity size={14} className="text-rose-400"/> Emergency Contact</Label>
              <Input type="tel" name="emergencyContact" value={profile?.emergencyContact || ""} onChange={handleChange} placeholder="+8801... (Relationship)" className={inputClass} />
            </div>

            <div className="space-y-2 col-span-full">
              <Label className="text-slate-600 font-medium flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> Present Address</Label>
              <Input name="presentAddress" value={profile?.presentAddress || ""} onChange={handleChange} placeholder="Full current residential address" className={inputClass} />
            </div>

            <div className="space-y-2 col-span-full">
              <Label className="text-slate-600 font-medium flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> Permanent Address</Label>
              <Input name="permanentAddress" value={profile?.permanentAddress || ""} onChange={handleChange} placeholder="Full permanent residential address" className={inputClass} />
            </div>
          </motion.div>
        )}

        {/* EMPLOYMENT TAB */}
        {activeTab === 'employment' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-sm">
            <div className="col-span-full flex items-center justify-between border-b border-white/50 pb-4 mb-2">
              <h2 className="text-xl font-bold text-slate-800">Employment Details</h2>
              {!isAdmin && <span className="text-xs px-2 py-1 bg-slate-200/50 text-slate-500 rounded-md font-medium uppercase tracking-widest">Admin Editable Only</span>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Employee Code (ID)</Label>
              <Input name="employeeCode" value={profile?.employeeCode || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Team (Read Only)</Label>
              <Input value={profile?.team?.name || "Unassigned"} readOnly className={readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Department</Label>
              <Input name="department" value={profile?.department || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Designation</Label>
              <Input name="designation" value={profile?.designation || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Branch / Office</Label>
              <Input name="branchOrOffice" value={profile?.branchOrOffice || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Employment Type</Label>
              {isAdmin ? (
                <select name="employmentType" value={profile?.employmentType || ""} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}>
                  <option value="">Select Type</option>
                  <option value="FULLTIME">Full Time</option>
                  <option value="INTERN">Intern</option>
                  <option value="PROJECTBASE">Project Based</option>
                </select>
              ) : (
                <Input value={profile?.employmentType || ""} readOnly className={readOnlyClass} />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Joining Date</Label>
              <Input type="date" name="joiningDate" value={profile?.joiningDate || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Confirmation Date</Label>
              <Input type="date" name="confirmationDate" value={profile?.confirmationDate || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Probation Status</Label>
              <Input name="probationStatus" value={profile?.probationStatus || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Employment Status</Label>
              {isAdmin ? (
                <select name="employmentStatus" value={profile?.employmentStatus || "Active"} onChange={handleChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Terminated">Terminated</option>
                </select>
              ) : (
                <Input value={profile?.employmentStatus || "Active"} readOnly className={readOnlyClass} />
              )}
            </div>
            
            <div className="space-y-2 col-span-full">
              <Label className="text-slate-600 font-medium">Work Location</Label>
              <Input name="workLocation" value={profile?.workLocation || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>
          </motion.div>
        )}

        {/* PAYROLL TAB */}
        {activeTab === 'payroll' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-sm">
            <div className="col-span-full flex items-center justify-between border-b border-white/50 pb-4 mb-2">
              <h2 className="text-xl font-bold text-slate-800">Payroll & Salary</h2>
              {!isAdmin && <span className="text-xs px-2 py-1 bg-slate-200/50 text-slate-500 rounded-md font-medium uppercase tracking-widest">Admin Editable Only</span>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Basic Salary</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <Input type="number" name="basicSalary" value={profile?.basicSalary || ""} onChange={handleChange} readOnly={!isAdmin} className={`pl-8 ${isAdmin ? inputClass : readOnlyClass}`} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Allowances</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <Input type="number" name="allowances" value={profile?.allowances || ""} onChange={handleChange} readOnly={!isAdmin} className={`pl-8 ${isAdmin ? inputClass : readOnlyClass}`} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Gross Salary</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <Input type="number" name="grossSalary" value={profile?.grossSalary || ""} onChange={handleChange} readOnly={!isAdmin} className={`pl-8 ${isAdmin ? inputClass : readOnlyClass}`} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Salary Grade</Label>
              <Input name="salaryGrade" value={profile?.salaryGrade || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2 col-span-full">
              <Label className="text-slate-600 font-medium">Tax Information (TIN)</Label>
              <Input name="taxInformation" value={profile?.taxInformation || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Bank Name</Label>
              <Input name="bankName" value={profile?.bankName || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Account Number</Label>
              <Input name="accountNumber" value={profile?.accountNumber || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Routing Number</Label>
              <Input name="routingNumber" value={profile?.routingNumber || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Mobile Banking (e.g. bKash)</Label>
              <Input name="mobileBanking" value={profile?.mobileBanking || ""} onChange={handleChange} readOnly={!isAdmin} className={isAdmin ? inputClass : readOnlyClass} />
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="flex justify-end pt-4">
          <Button type="submit" disabled={saving} className="relative h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95 text-base font-semibold group overflow-hidden">
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
