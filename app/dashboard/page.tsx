'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";
import LeftSidebar from "../components/left-side-bar";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // ✅ Protect page — redirect to main if not logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/"); // redirect to login/main page
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#001852] text-white">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main blank dashboard area */}
      <main className="flex-1 flex items-center justify-center bg-[#002b6b]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">Welcome back! This area is currently blank.</p>
        </div>
      </main>
    </div>
  );
}
