"use client";

import React from "react";
import { UserForm } from "@/components/users/UserForm";

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Add New User</h1>
        <p className="text-slate-500">Create a new user account and set up their profile details.</p>
      </div>
      <UserForm />
    </div>
  );
}
