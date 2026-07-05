"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, UserCircle, Briefcase, ChevronRight, LogOut, Loader2, Play, Square, Activity, Bell, MapPin, Sparkles } from 'lucide-react';

export default function DashboardPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    
    // Derived state for today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendances = attendances.filter((a: any) => new Date(a.date).toISOString().split('T')[0] === today);
    
    let totalMilliseconds = 0;
    let isCurrentlyCheckedIn = false;

    todayAttendances.forEach((a: any) => {
        if (a.checkIn && !a.checkOut) {
            isCurrentlyCheckedIn = true;
        } else if (a.checkIn && a.checkOut) {
            totalMilliseconds += (new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime());
        }
    });

    const totalHours = totalMilliseconds / (1000 * 60 * 60);
    const shiftCompleted = totalHours >= 5;
    
    const hasCheckedIn = isCurrentlyCheckedIn || shiftCompleted;
    const hasCheckedOut = !isCurrentlyCheckedIn || shiftCompleted;

    const [projects, setProjects] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [celebrations, setCelebrations] = useState({ birthdays: [], newJoiners: [] });

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            
            const [taskRes, schedRes, attRes, projRes, profRes, leaveRes, celebRes] = await Promise.all([
                fetch('/api/tasks', { headers }),
                fetch('/api/schedule', { headers }),
                fetch('/api/attendance', { headers }),
                fetch('/api/projects', { headers }),
                fetch('/api/profile/me', { headers }),
                fetch('/api/leaves/my-requests', { headers }),
                fetch('/api/users/events/celebrations', { headers })
            ]);

            if (taskRes.ok) setTasks(await taskRes.json());
            if (schedRes.ok) setSchedules(await schedRes.json());
            if (attRes.ok) setAttendances(await attRes.json());
            if (projRes.ok) setProjects(await projRes.json());
            if (profRes.ok) setProfile(await profRes.json());
            
            if (leaveRes.ok) {
                const leaveData = await leaveRes.json();
                if (leaveData.success) setLeaves(leaveData.data);
            }
            if (celebRes.ok) {
                const celebData = await celebRes.json();
                setCelebrations(celebData.data);
            }
            
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAttendance = async (action: 'check-in' | 'check-out') => {
        setIsCheckingIn(true);
        const token = localStorage.getItem('token');
        
        try {
            await fetch(`/api/attendance/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchData(); // Refresh data
        } catch (error) {
            console.error(`Failed to ${action}:`, error);
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const uploadRes = await fetch('/api/upload/single', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (uploadRes.ok) {
                const data = await uploadRes.json();
                const imageUrl = data.fileUrl || data.url || data.path; // Depends on your UploadController structure
                
                if (imageUrl) {
                    await fetch('/api/profile/update', {
                        method: 'POST',
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ profilePicture: imageUrl })
                    });
                    await fetchData();
                }
            }
        } catch (error) {
            console.error("Image upload failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50 p-4 md:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <motion.div 
                className="max-w-7xl mx-auto space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                    <div className="flex items-center gap-5">
                        {/* Profile Image Upload */}
                        <label className="relative cursor-pointer group shrink-0">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageUpload} 
                                disabled={loading}
                            />
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-lg shadow-indigo-100/50 relative transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
                                {profile?.profilePicture ? (
                                    <img 
                                        src={profile.profilePicture.startsWith('http') ? profile.profilePicture : `http://localhost:8080${profile.profilePicture}`} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                                        <UserCircle className="w-10 h-10 text-indigo-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    <span className="text-white text-xs font-bold tracking-wider">EDIT</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white shadow-sm"></div>
                        </label>
                        <div>
                            <motion.h1 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight"
                            >
                                Good morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">{profile?.user?.name ? profile.user.name.split(' ')[0] : 'there'}</span>
                            </motion.h1>
                            <div className="flex items-center gap-2 mt-2 text-slate-500">
                                <Briefcase className="w-4 h-4 text-indigo-400" />
                                <span className="font-medium">{profile?.designation || 'Team Member'}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Check In/Out Widget */}
                    <div className="p-2 rounded-2xl bg-white/60 backdrop-blur-xl shadow-lg shadow-slate-200/50 border border-white flex items-center gap-2">
                        {!hasCheckedIn ? (
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAttendance('check-in')}
                                disabled={isCheckingIn}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all hover:shadow-indigo-500/40"
                            >
                                {isCheckingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white/20" />}
                                Start Shift
                            </motion.button>
                        ) : !hasCheckedOut ? (
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAttendance('check-out')}
                                disabled={isCheckingIn}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-semibold shadow-md shadow-rose-500/20 disabled:opacity-50 transition-all hover:shadow-rose-500/40"
                            >
                                {isCheckingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5 fill-white/20" />}
                                End Shift
                            </motion.button>
                        ) : (
                            <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20">
                                <CheckCircle2 className="w-5 h-5" />
                                Shift Completed
                            </div>
                        )}
                        
                        <div className="px-5 text-center border-l border-slate-200/60 flex flex-col items-center justify-center min-w-[100px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Time</span>
                            <span className="text-lg font-bold text-slate-700 font-mono tracking-tight">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Left Column */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* Projects Section */}
                        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-xl shadow-slate-200/40 rounded-[2rem] p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-2.5 bg-indigo-100 rounded-xl">
                                            <Briefcase className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        Active Projects
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">You are currently assigned to {projects.length} projects.</p>
                                </div>
                                <motion.button whileHover={{ x: 3 }} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                    View All <ChevronRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {projects.length === 0 ? (
                                    <div className="col-span-2 py-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Briefcase className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 font-medium">No projects assigned yet.</p>
                                    </div>
                                ) : (
                                    projects.map((project: any) => (
                                        <motion.div 
                                            whileHover={{ y: -4, scale: 1.01 }}
                                            key={project.id} 
                                            className="group relative p-5 rounded-3xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 overflow-hidden"
                                        >
                                            {/* Decorative Background */}
                                            {project.image && (
                                                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                                    <img src={project.image.startsWith('http') ? project.image : `http://localhost:8080${project.image}`} alt="" className="w-full h-full object-cover rounded-bl-full" />
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">{project.name}</h3>
                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{project.description || 'No description provided'}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 mb-5">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className="text-slate-600">Progress</span>
                                                    <span className="text-indigo-600">{project.progress || 0}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${project.progress || 0}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full" 
                                                    />
                                                </div>
                                            </div>

                                            {project.stats && (
                                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100/60">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-semibold">
                                                        <UserCircle className="w-3.5 h-3.5" />
                                                        {project.stats.activeUsers}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
                                                        <Activity className="w-3.5 h-3.5" />
                                                        {project.stats.totalTasks} Total
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {project.stats.pendingTasks} Pending
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                                                        <Activity className="w-3.5 h-3.5" />
                                                        {project.stats.inreviewTasks} In Review
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        {project.stats.successTasks} Done
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Tasks Section */}
                        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-xl shadow-slate-200/40 rounded-[2rem] p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-2.5 bg-violet-100 rounded-xl">
                                            <Activity className="w-6 h-6 text-violet-600" />
                                        </div>
                                        Recent Tasks
                                    </h2>
                                </div>
                                <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600">
                                    {tasks.length} Total
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {tasks.length === 0 ? (
                                    <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
                                        <p className="text-slate-500 font-medium">Your task list is empty.</p>
                                    </div>
                                ) : (
                                    tasks.slice(0, 5).map((task: any, i) => (
                                        <motion.div 
                                            whileHover={{ x: 4, scale: 1.005 }}
                                            key={task.id} 
                                            className="group flex items-center justify-between p-4 md:p-5 rounded-2xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50/50 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                                    task.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                                                    task.status === 'in_progress' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                                                    'bg-slate-50 border-slate-100 text-slate-400'
                                                }`}>
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-700 group-hover:text-violet-700 transition-colors">{task.title}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                            {task.project?.name || 'General'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-xs px-3 py-1.5 rounded-lg font-bold tracking-wide uppercase ${
                                                    task.status === 'completed' ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' :
                                                    task.status === 'in_progress' ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' :
                                                    'bg-slate-200 text-slate-600'
                                                }`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Team Schedule */}
                        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-xl shadow-slate-200/40 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
                            {/* Decorative Blur */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                            
                            <h2 className="text-2xl font-bold flex items-center gap-3 mb-8 relative z-10 text-slate-800">
                                <div className="p-2.5 bg-indigo-100 rounded-xl">
                                    <Calendar className="w-6 h-6 text-indigo-600" />
                                </div>
                                Team Schedule
                            </h2>
                            
                            <div className="space-y-4 relative z-10">
                                {schedules.length === 0 ? (
                                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-slate-500">No schedules for today.</p>
                                    </div>
                                ) : (
                                    schedules.map((schedule: any) => (
                                        <div key={schedule.id} className="group bg-white hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 p-4 rounded-2xl flex items-center justify-between transition-all cursor-default">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-200 flex items-center justify-center border border-indigo-50">
                                                    <span className="text-indigo-700 font-bold text-lg">
                                                        {schedule.user?.name ? schedule.user.name.charAt(0).toUpperCase() : '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{schedule.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{schedule.dayOfWeek}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 inline-block group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                                                    <p className="text-sm font-mono font-bold text-slate-700">{schedule.startTime}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center">to</p>
                                                    <p className="text-sm font-mono font-bold text-slate-700">{schedule.endTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Leaves & Celebrations Container */}
                        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-xl shadow-slate-200/40 rounded-[2rem] p-6 md:p-8 space-y-8">
                            
                            {/* Leave Requests */}
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
                                    <MapPin className="w-5 h-5 text-rose-500" />
                                    My Time Off
                                </h2>
                                <div className="space-y-3">
                                    {leaves.length === 0 ? (
                                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">No leave requests.</p>
                                    ) : (
                                        leaves.slice(0, 3).map((leave: any) => (
                                            <div key={leave.id} className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-slate-700">{leave.leaveType?.name || 'Leave'}</p>
                                                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                                                        leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        leave.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {leave.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                                                    {' - '}
                                                    {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Celebrations */}
                            <div className="pt-8 border-t border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
                                    <Bell className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                                    Announcements
                                </h2>
                                
                                <div className="space-y-4">
                                    {celebrations.birthdays.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Birthdays</h3>
                                            <div className="flex flex-wrap gap-3">
                                                {celebrations.birthdays.map((b: any) => (
                                                    <div key={b.id} className="flex items-center gap-2 bg-slate-50 pr-3 rounded-full border border-slate-100">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
                                                            {b.profilePicture ? (
                                                                <img src={b.profilePicture.startsWith('http') ? b.profilePicture : `http://localhost:8080${b.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <UserCircle className="w-full h-full text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="py-1">
                                                            <p className="text-xs font-bold text-slate-700 leading-none">{b.name}</p>
                                                            <p className="text-[10px] text-indigo-500 font-bold mt-0.5">{new Date(b.dateOfBirth).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {celebrations.newJoiners.length > 0 && (
                                        <div className={celebrations.birthdays.length > 0 ? "pt-2" : ""}>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">New Joiners</h3>
                                            <div className="space-y-2">
                                                {celebrations.newJoiners.slice(0, 2).map((nj: any) => (
                                                    <div key={nj.id} className="flex items-center gap-3 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-indigo-100">
                                                            {nj.profilePicture ? (
                                                                <img src={nj.profilePicture.startsWith('http') ? nj.profilePicture : `http://localhost:8080${nj.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <UserCircle className="w-full h-full text-indigo-300" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 truncate">{nj.name}</p>
                                                            <p className="text-xs text-slate-500 font-medium truncate">{nj.designation || 'New Employee'}</p>
                                                        </div>
                                                        <div className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                                            Welcome
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {celebrations.birthdays.length === 0 && celebrations.newJoiners.length === 0 && (
                                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">No recent announcements.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
