"use client";

import React, { useEffect, useState, use } from "react";
import { UserForm } from "@/components/users/UserForm";
import { Loader2 } from "lucide-react";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch user data
      const userRes = await fetch(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data.data || data); // Just in case it's nested
      }

      // Fetch profile data
      const profileRes = await fetch(`/api/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfileData(pData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Edit User</h1>
        <p className="text-slate-500">Update account and profile information.</p>
      </div>
      <UserForm initialUser={userData} initialProfile={profileData} />
    </div>
  );
}
