'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import LeftSidebar from "../components/left-side-bar"; 

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ Load user profile from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/"); // redirect if not logged in
      } else {
        setUid(user.uid);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setName(userData.fullName || "");
            setEmail(userData.email || "");
          }
        } catch (error) {
          console.error("Error loading profile:", error);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ Update Firestore profile fields
  const handleUpdate = async () => {
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        fullName: name,
        email: email,
      });
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("❌ Failed to update profile.");
    }
  };

  if (loading)
    return <div className="text-center mt-20 text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#001852] text-white">
      {/* ==================== Left Side Bar ==================== */}
      <LeftSidebar />

      {/* ==================== MAIN PROFILE CONTENT ==================== */}
      <main className="flex-1 flex items-center justify-center bg-[#002b6b]">
        <div className="bg-[#001f4d] rounded-2xl p-8 w-[400px] shadow-lg flex flex-col items-center">
          {/* Logo Header */}
          <div className="flex items-center gap-2 mb-6">
            <Image src="/logo_light.png" alt="Cool To Do Logo" width={200} height={200} />
          </div>

          {/* Profile Icon */}
          <div className="bg-[#002b6b] rounded-full p-6 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A9 9 0 1118.879 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <p className="text-lg font-medium mb-4">{name || "Unnamed User"}</p>

          {/* Profile Inputs */}
          <div className="w-full space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#001241] text-white w-full p-2 rounded outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Full Name"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#001241] text-white w-full p-2 rounded outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Email"
            />

            <button
              onClick={handleUpdate}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold w-full p-2 rounded"
            >
              Update Information
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold w-full p-2 rounded">
              Delete Account
            </button>
            {message && (
              <p className="text-sm mt-2 text-center text-cyan-300">{message}</p>
            )}
          </div>
        </div>
      </main>

      {/* ==================== RIGHT ACHIEVEMENTS PANEL ==================== */}
      <aside className="w-64 bg-[#d00000] p-6 text-white flex flex-col">
        <h2 className="text-lg font-bold mb-6 uppercase">Achievements</h2>

        <div className="space-y-6 text-sm">
          <div>
            <p className="font-semibold">"Task Streak"</p>
            <div className="w-full bg-white h-2 rounded">
              <div className="bg-yellow-400 h-2 rounded" style={{ width: "70%" }}></div>
            </div>
            <p className="text-xs mt-1">Level 4 / 5</p>
          </div>

          <div>
            <p className="font-semibold">"Goal Getter"</p>
            <div className="w-full bg-white h-2 rounded">
              <div className="bg-cyan-400 h-2 rounded" style={{ width: "45%" }}></div>
            </div>
            <p className="text-xs mt-1">Level 2 / 5</p>
          </div>

          <div>
            <p className="font-semibold">"Productivity Master"</p>
            <div className="w-full bg-white h-2 rounded">
              <div className="bg-green-400 h-2 rounded" style={{ width: "80%" }}></div>
            </div>
            <p className="text-xs mt-1">Level 5 / 5</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
