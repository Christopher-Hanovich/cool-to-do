"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../utils/firebase";
import LeftSidebar from "../components/left-side-bar";

interface Task {
  id: string;
  title: string;
  description: string;
  startDay: string;
  endDay: string;
  completed: boolean;
}

export default function TasksPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [completed, setCompleted] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      const list: Task[] = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Task, "id">),
        }))
        .sort((a, b) => String(b.endDay ?? "").localeCompare(String(a.endDay ?? "")));
      setTasks(list);
    });

    return () => unsub();
  }, [user]);

  const username =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "GUEST";

  async function createTask() {
    if (!title.trim() || !user) return;

    await addDoc(collection(db, "tasks"), {
      title,
      description,
      startDay: startDay,
      endDay: endDay,
      completed: completed,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDescription("");
    setStartDay("");
    setEndDay("");
    setShowCreate(false);
  }

  async function toggleCompletion(id: string, current?: boolean) {
    await updateDoc(doc(db, "tasks", id), { completed: !current });
  }

  async function deleteTask(id: string) {
    await deleteDoc(doc(db, "tasks", id));
  }

  async function saveEdit(id: string) {
    await updateDoc(doc(db, "tasks", id), {
      title: editTitle,
      description: editDescription,
    });
    setEditingId(null);
  }

  return (
    <div className="flex min-h-screen bg-[#04143A] text-white">
      <LeftSidebar />

      <main className="flex-1 px-16 py-12 relative">
        <h1 className="text-xl mb-8">
          WELCOME BACK,<br />
          <span className="font-semibold">{username.toUpperCase()}</span>
        </h1>

        <div className="bg-[#072B63] rounded-3xl p-8 w-[420px] mb-16">
          <p className="mb-4 text-sm font-semibold">
            ARE YOU BORED ? TRY THESE:
          </p>
          <ul className="text-sm space-y-1">
            <li>• Write a short story or random thoughts.</li>
            <li>• Learn a new word or fun fact.</li>
            <li>• Brainstorm future goals or project ideas.</li>
            <li>• Do a mini-workout.</li>
            <li>• Learn a new skill on YouTube.</li>
            <li>• Practice typing speed or try a coding challenge.</li>
          </ul>
        </div>

        <h2 className="text-center text-lg mb-6">TASKS To Do</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="text-xs uppercase text-yellow-400/80">
              <tr>
                <th className="py-2 pr-4">Done</th>
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="text-white/90">
              {tasks .filter(t => !t.completed).map((t, i) => (
                <tr key={t.id} className="border-t border-white/10">
                  <td className="py-2 pr-4 align-middle">
                    <input
                      type="checkbox"
                      aria-label={`Mark ${t.title} done`}
                      className="h-4 w-4"
                      checked={!!t.completed}
                      onChange={() => toggleCompletion(t.id, t.completed)}
                    />
                  </td>
                  <td className="py-2 pr-4 align-middle">{i + 1}</td>
                  <td className="py-2 pr-4">{t.title}</td>
                  <td className="py-2 pr-4">{t.description}</td>
                  <td className="py-2 pr-4">{t.endDay || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-center text-lg mt-12 mb-6">Completed Tasks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="text-xs uppercase text-yellow-400/80">
              <tr>
                <th className="py-2 pr-4">Done</th>
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Description</th>
              </tr>
            </thead>
            <tbody className="text-white/90">
              {tasks .filter(t => t.completed).map((t, i) => (
                <tr key={t.id} className="border-t border-white/10">
                  <td className="py-2 pr-4 align-middle">
                    <input
                      type="checkbox"
                      aria-label={`Mark ${t.title} done`}
                      className="h-4 w-4"
                      checked={!!t.completed}
                      onChange={() => toggleCompletion(t.id, t.completed)}
                    />
                  </td>
                  <td className="py-2 pr-4 align-middle">{i + 1}</td>
                  <td className="py-2 pr-4">{t.title}</td>
                  <td className="py-2 pr-4">{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Floating buttons */}
        <div className="fixed bottom-10 right-12 space-y-2 text-sm">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 text-yellow-400"
          >
            + Create New Task
          </button>
          <button
            onClick={() => setShowManage(true)}
            className="flex items-center gap-2 text-yellow-400"
          >
            ✏ Manage All Tasks
          </button>
        </div>
      </main>

      {/* Create Task Overlay */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-yellow-400 w-[900px] rounded-[40px] px-20 py-14 text-[#04143A]">
            <h2 className="text-center text-2xl font-semibold mb-10">
              CREATE NEW TASK
            </h2>

            <label className="block mb-2">Title</label>
            <input
              type="text"
              title="Title"
              className="w-full rounded-full px-6 py-3 mb-6 border-2 border-[#04143A]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="block mb-2">Description</label>
            <input
              type="text"
              title="Description"
              className="w-full rounded-full px-6 py-3 mb-10 border-2 border-[#04143A]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-between mb-12">
              <div>
                <label className="block mb-2">Start day</label>
                <input
                  type="date"
                  title="Start date"
                  className="rounded-full px-4 py-2 border-2 border-[#04143A]"
                  value={startDay}
                  onChange={(e) => setStartDay(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2">Due date</label>
                <input
                  type="date"
                  title="Due date"
                  className="rounded-full px-4 py-2 border-2 border-[#04143A]"
                  value={endDay}
                  onChange={(e) => setEndDay(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={createTask}
                className="bg-[#04143A] text-white px-10 py-2 rounded-full"
              >
                CREATE
              </button>
            </div>
          </div>
        </div>
      )}

     {/* Manages all Overlay */}
      {showManage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-yellow-400 w-[900px] rounded-[40px] px-14 py-10 text-[#04143A] max-h-[80vh] overflow-y-auto">
            <h2 className="text-center text-2xl font-semibold mb-8">
              MANAGE TASKS
            </h2>

            <div className="space-y-4">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl p-4 flex justify-between items-center"
                >
                  {editingId === t.id ? (
                    <div className="flex-1 mr-4">
                      <input
                        type="text"
                        title="Edit Title"
                        className="w-full mb-2 px-3 py-1 rounded"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <input
                        type="text"
                        title="Edit Description"
                        className="w-full px-3 py-1 rounded"
                        value={editDescription}
                        onChange={(e) =>
                          setEditDescription(e.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-sm">{t.description}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {editingId === t.id ? (
                      <button
                        onClick={() => saveEdit(t.id)}
                        className="text-green-600"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(t.id);
                          setEditTitle(t.title);
                          setEditDescription(t.description);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => setShowManage(false)}
                className="bg-[#04143A] text-white px-8 py-2 rounded-full"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

