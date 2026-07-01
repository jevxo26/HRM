"use client";


import { motion } from "framer-motion";

import { SignInForm } from "@/components/auth/signin";

export default function LoginPage() {


    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 sm:p-8">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px]" />
                <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-400/20 blur-[120px]" />
                <div className="absolute top-[20%] left-[60%] w-[30%] h-[30%] rounded-full bg-cyan-400/20 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-3xl p-8 sm:p-10 border border-white/20">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Enter your credentials to access your account</p>
                    </div>

                    <SignInForm />
                </div>
            </motion.div>
        </div>
    );
}
