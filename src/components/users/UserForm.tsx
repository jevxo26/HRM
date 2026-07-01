"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Briefcase, Phone, CreditCard, ChevronRight, ChevronLeft, Save, Loader2, Mail, MapPin, Building, Activity } from "lucide-react";
import Select from "react-select";

export function UserForm({ initialUser, initialProfile }: { initialUser?: any; initialProfile?: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<number | null>(initialUser?.id || null);

  // Step 1: Account Data
  const [accountData, setAccountData] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    role: initialUser?.role || "employee",
    password: "",
  });

  // Step 2: Profile Data
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
  const [profileData, setProfileData] = useState<any>(initialProfile || {});

  useEffect(() => {
    if (initialProfile) {
      const p = { ...initialProfile };
      if (p.dateOfBirth) p.dateOfBirth = p.dateOfBirth.split('T')[0];
      if (p.joiningDate) p.joiningDate = p.joiningDate.split('T')[0];
      if (p.confirmationDate) p.confirmationDate = p.confirmationDate.split('T')[0];
      setProfileData(p);
    }
  }, [initialProfile]);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numberFields = ['basicSalary', 'allowances', 'grossSalary'];
    if (numberFields.includes(name)) {
      setProfileData((prev: any) => ({ ...prev, [name]: value ? parseFloat(value) : null }));
    } else {
      setProfileData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const isEdit = !!initialUser;
      const url = isEdit ? `/api/users/${initialUser.id}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";

      const payload = { ...accountData };
      if (isEdit && !payload.password) {
        delete (payload as any).password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save account");
      }

      const data = await res.json();
      if (!isEdit && data.data) {
        setCreatedUserId(data.data.id);
      }
      
      toast.success(isEdit ? "Account updated. Let's update the profile." : "Account created! Let's build the profile.");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdUserId) {
      toast.error("User ID missing. Cannot save profile.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { ...profileData, userId: createdUserId };

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.success("Profile saved successfully!");
      router.push("/dashboard/users");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-white/50 border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-indigo-400/20 transition-all rounded-xl shadow-sm";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
        <div className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -z-10 transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>
        
        <div className="w-full flex justify-between">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
            <span className={`mt-2 text-xs font-semibold ${step >= 1 ? 'text-indigo-700' : 'text-slate-400'}`}>Account Setup</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
            <span className={`mt-2 text-xs font-semibold ${step >= 2 ? 'text-indigo-700' : 'text-slate-400'}`}>Profile Details</span>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={submitAccount} className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">1. Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input name="name" value={accountData.name} onChange={handleAccountChange} required className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input type="email" name="email" value={accountData.email} onChange={handleAccountChange} required className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label>System Role *</Label>
                  <Select
                    options={[
                      { value: "admin", label: "Admin" },
                      { value: "employee", label: "Employee" },
                      { value: "hr", label: "HR" },
                      { value: "cto", label: "CTO" },
                      { value: "founder", label: "Founder" },
                      { value: "ceo", label: "CEO" },
                      { value: "teamlead", label: "Team Lead" },
                    ]}
                    value={{ value: accountData.role, label: accountData.role.toUpperCase() }}
                    onChange={(opt) => setAccountData({ ...accountData, role: opt?.value || "employee" })}
                    classNames={{ control: () => "bg-white/50 border-slate-200 rounded-xl shadow-sm hover:border-indigo-400" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{initialUser ? "New Password (Optional)" : "Password *"}</Label>
                  <Input type="password" name="password" value={accountData.password} onChange={handleAccountChange} required={!initialUser} className={inputClass} />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700">
                  {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={submitProfile} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold text-slate-800">2. Profile Details</h2>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setActiveProfileTab('personal')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${activeProfileTab === 'personal' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><UserCircle size={14}/> Personal</button>
                  <button type="button" onClick={() => setActiveProfileTab('contact')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${activeProfileTab === 'contact' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><Phone size={14}/> Contact</button>
                  <button type="button" onClick={() => setActiveProfileTab('employment')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${activeProfileTab === 'employment' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><Briefcase size={14}/> Job</button>
                  <button type="button" onClick={() => setActiveProfileTab('payroll')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${activeProfileTab === 'payroll' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><CreditCard size={14}/> Payroll</button>
                </div>
              </div>

              <div className="min-h-[300px] p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                
                {activeProfileTab === 'personal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Gender</Label>
                      <select name="gender" value={profileData?.gender || ""} onChange={handleProfileChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}>
                        <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5"><Label>Date of Birth</Label><Input type="date" name="dateOfBirth" value={profileData?.dateOfBirth || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Blood Group</Label><Input name="bloodGroup" value={profileData?.bloodGroup || ""} onChange={handleProfileChange} className={inputClass} placeholder="e.g. O+" /></div>
                    <div className="space-y-1.5"><Label>Marital Status</Label><Input name="maritalStatus" value={profileData?.maritalStatus || ""} onChange={handleProfileChange} className={inputClass} placeholder="e.g. Single" /></div>
                    <div className="space-y-1.5"><Label>Nationality</Label><Input name="nationality" value={profileData?.nationality || ""} onChange={handleProfileChange} className={inputClass} placeholder="e.g. Bangladeshi" /></div>
                    <div className="space-y-1.5"><Label>Religion</Label><Input name="religion" value={profileData?.religion || ""} onChange={handleProfileChange} className={inputClass} placeholder="e.g. Islam" /></div>
                    <div className="space-y-1.5 col-span-full"><Label>NID / Passport</Label><Input name="nidOrPassport" value={profileData?.nidOrPassport || ""} onChange={handleProfileChange} className={inputClass} placeholder="ID Number" /></div>
                  </div>
                )}

                {activeProfileTab === 'contact' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Personal Email</Label><Input type="email" name="personalEmail" value={profileData?.personalEmail || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Official Email</Label><Input type="email" name="officialEmail" value={profileData?.officialEmail || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Mobile Number</Label><Input type="tel" name="mobileNumber" value={profileData?.mobileNumber || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Emergency Contact</Label><Input type="tel" name="emergencyContact" value={profileData?.emergencyContact || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5 col-span-full"><Label>Present Address</Label><Input name="presentAddress" value={profileData?.presentAddress || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5 col-span-full"><Label>Permanent Address</Label><Input name="permanentAddress" value={profileData?.permanentAddress || ""} onChange={handleProfileChange} className={inputClass} /></div>
                  </div>
                )}

                {activeProfileTab === 'employment' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Employee Code</Label><Input name="employeeCode" value={profileData?.employeeCode || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Department</Label><Input name="department" value={profileData?.department || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Designation</Label><Input name="designation" value={profileData?.designation || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Employment Type</Label>
                      <select name="employmentType" value={profileData?.employmentType || ""} onChange={handleProfileChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}>
                        <option value="">Select Type</option><option value="FULLTIME">Full Time</option><option value="INTERN">Intern</option><option value="PROJECTBASE">Project Based</option>
                      </select>
                    </div>
                    <div className="space-y-1.5"><Label>Joining Date</Label><Input type="date" name="joiningDate" value={profileData?.joiningDate || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Confirmation Date</Label><Input type="date" name="confirmationDate" value={profileData?.confirmationDate || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Employment Status</Label>
                      <select name="employmentStatus" value={profileData?.employmentStatus || "Active"} onChange={handleProfileChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}>
                        <option value="Active">Active</option><option value="On Leave">On Leave</option><option value="Resigned">Resigned</option><option value="Terminated">Terminated</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeProfileTab === 'payroll' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Basic Salary</Label><Input type="number" name="basicSalary" value={profileData?.basicSalary || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Gross Salary</Label><Input type="number" name="grossSalary" value={profileData?.grossSalary || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Allowances</Label><Input type="number" name="allowances" value={profileData?.allowances || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Salary Grade</Label><Input name="salaryGrade" value={profileData?.salaryGrade || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Bank Name</Label><Input name="bankName" value={profileData?.bankName || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Account Number</Label><Input name="accountNumber" value={profileData?.accountNumber || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Routing Number</Label><Input name="routingNumber" value={profileData?.routingNumber || ""} onChange={handleProfileChange} className={inputClass} /></div>
                    <div className="space-y-1.5"><Label>Mobile Banking</Label><Input name="mobileBanking" value={profileData?.mobileBanking || ""} onChange={handleProfileChange} className={inputClass} placeholder="e.g. bKash" /></div>
                  </div>
                )}

              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-xl px-6">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30">
                  {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Finish Setup
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
