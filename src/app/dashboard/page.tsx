"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, UserCircle, Briefcase, ChevronRight, LogOut, Loader2, Play, Square } from 'lucide-react';

export default function DashboardPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    
    // Derived state for today's attendance
    const todayAttendance = attendances.find((a: any) => {
        const today = new Date().toISOString().split('T')[0];
        const attDate = new Date(a.date).toISOString().split('T')[0];
        return today === attDate;
    });
    
    const hasCheckedIn = !!todayAttendance?.checkIn;
    const hasCheckedOut = !!todayAttendance?.checkOut;

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
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        {/* Profile Image Upload */}
                        <label className="relative cursor-pointer group">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageUpload} 
                                disabled={loading}
                            />
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm relative">
                                {profile?.profilePicture ? (
                                    <img 
                                        src={profile.profilePicture.startsWith('http') ? profile.profilePicture : `http://localhost:8080${profile.profilePicture}`} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <UserCircle className="w-full h-full text-slate-400 p-2" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-[10px] font-bold">EDIT</span>
                                </div>
                            </div>
                        </label>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">
                                {profile?.user?.name ? `${profile.user.name}'s Workspace` : 'Employee Workspace'}
                            </h1>
                            <p className="text-slate-500 mt-1">{profile?.designation || 'Manage your daily tasks, schedule, and attendance.'}</p>
                        </div>
                    </div>
                    
                    {/* Check In/Out Widget */}
                    <div className="p-1 rounded-2xl bg-white shadow-sm border border-slate-100 inline-flex items-center gap-2">
                        {!hasCheckedIn ? (
                            <button 
                                onClick={() => handleAttendance('check-in')}
                                disabled={isCheckingIn}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                Check In
                            </button>
                        ) : !hasCheckedOut ? (
                            <button 
                                onClick={() => handleAttendance('check-out')}
                                disabled={isCheckingIn}
                                className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                                Check Out
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Shift Completed
                            </div>
                        )}
                        
                        <div className="px-4 text-sm font-medium text-slate-600 border-l border-slate-100">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column - Projects & Tasks */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Projects Section */}
                        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-8 shadow-sm mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Briefcase className="w-5 h-5 text-indigo-500" />
                                    My Projects
                                </h2>
                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    {projects.length} Active
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {projects.length === 0 ? (
                                    <p className="text-slate-400 py-4 col-span-2">No projects assigned.</p>
                                ) : (
                                    projects.map((project: any) => (
                                        <div key={project.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors flex flex-col gap-3 relative overflow-hidden">
                                            {project.image && (
                                                <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                                                    <img src={project.image.startsWith('http') ? project.image : `http://localhost:8080${project.image}`} alt="" className="w-full h-full object-cover rounded-bl-full" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-slate-800">{project.name}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{project.description || 'No description'}</p>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                                                <span>Progress</span>
                                                <span>{project.progress || 0}%</span>
                                            </div>

                                            {/* Stats */}
                                            {project.stats && (
                                                <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-200">
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-400 uppercase">Members</p>
                                                        <p className="font-semibold text-slate-700">{project.stats.activeUsers}</p>
                                                    </div>
                                                    <div className="text-center border-l border-r border-slate-200">
                                                        <p className="text-[10px] text-slate-400 uppercase">Pending</p>
                                                        <p className="font-semibold text-amber-600">{project.stats.pendingTasks}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-400 uppercase">Success</p>
                                                        <p className="font-semibold text-emerald-600">{project.stats.successTasks}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Tasks Section */}
                        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                    Assigned Tasks
                                </h2>
                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    {tasks.length} Active
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                {tasks.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8">No tasks assigned yet.</p>
                                ) : (
                                    tasks.map((task: any, i) => (
                                        <div key={task.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all cursor-pointer">
                                            <div>
                                                <h3 className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{task.project?.name || 'No Project'}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                    task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {task.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Team Schedule */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
                                <Calendar className="w-5 h-5 text-indigo-300" />
                                Team Schedule
                            </h2>
                            
                            <div className="space-y-4">
                                {schedules.length === 0 ? (
                                    <p className="text-slate-400 text-center py-4">No schedules posted.</p>
                                ) : (
                                    schedules.map((schedule: any) => (
                                        <div key={schedule.id} className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                    <UserCircle className="w-6 h-6 text-indigo-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{schedule.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-indigo-200">{schedule.dayOfWeek}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">{schedule.startTime}</p>
                                                <p className="text-xs text-indigo-200">to {schedule.endTime}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Leaves Section */}
                        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    My Leave Requests
                                </h2>
                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    {leaves.length} Total
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                {leaves.length === 0 ? (
                                    <p className="text-slate-400 text-center py-4">No leave requests found.</p>
                                ) : (
                                    leaves.map((leave: any) => (
                                        <div key={leave.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-700">{leave.leaveType?.name || 'Leave'}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                    leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    leave.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {leave.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Celebrations Section */}
                        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-8 shadow-sm">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 mb-6">
                                🎉 Celebrations & Updates
                            </h2>
                            
                            <div className="space-y-6">
                                {/* Birthdays */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Upcoming Birthdays</h3>
                                    <div className="space-y-3">
                                        {celebrations.birthdays.length === 0 ? (
                                            <p className="text-slate-400 text-sm">No birthdays this month.</p>
                                        ) : (
                                            celebrations.birthdays.map((b: any) => (
                                                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                                        {b.profilePicture ? (
                                                            <img src={b.profilePicture.startsWith('http') ? b.profilePicture : `http://localhost:8080${b.profilePicture}`} alt={b.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserCircle className="w-full h-full text-slate-400 p-1" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-700 truncate">{b.name}</p>
                                                        <p className="text-xs text-indigo-500 font-medium">{new Date(b.dateOfBirth).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* New Joiners */}
                                <div className="pt-4 border-t border-slate-100">
                                    <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">New Joiners</h3>
                                    <div className="space-y-3">
                                        {celebrations.newJoiners.length === 0 ? (
                                            <p className="text-slate-400 text-sm">No new joiners recently.</p>
                                        ) : (
                                            celebrations.newJoiners.map((nj: any) => (
                                                <div key={nj.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                                        {nj.profilePicture ? (
                                                            <img src={nj.profilePicture.startsWith('http') ? nj.profilePicture : `http://localhost:8080${nj.profilePicture}`} alt={nj.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserCircle className="w-full h-full text-slate-400 p-1" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-700 truncate">{nj.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{nj.designation || 'Employee'}</p>
                                                    </div>
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">NEW</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
