'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";


import React from "react";

const LeftSidebar: React.FC = () => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      router.replace("/"); // redirect to main page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-56 bg-[#000f3a] flex flex-col justify-between p-6 text-white">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Image
            src="/logo_dark.png"
            alt="Cool To Do Logo"
            width={200}
            height={200}
          />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4 text-sm">
          <Link href="/tasks" className="flex items-center gap-2 hover:text-yellow-300">
            📝 Tasks
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-yellow-300">
            📊 Dashboard
          </Link>
          <Link href="/profile" className="flex items-center gap-2 text-yellow-400">
            👤 Profile
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="text-red-400 hover:text-red-600 flex items-center gap-2 transition-colors"
      >
        🚪 Log Out
      </button>
    </aside>
  );
};

export default LeftSidebar;
