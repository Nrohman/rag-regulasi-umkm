"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/store/useChatStore";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Scale,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const router = useRouter();
  const {
    sessions,
    currentSessionId,
    fetchSessions,
    createNewSession,
    selectSession,
    renameSession,
    deleteSession,
    isSidebarOpen,
    toggleSidebar,
    resetCurrentChat,
  } = useChatStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleNewChat = async () => {
    resetCurrentChat();
    router.push("/");
  };

  const handleSelectSession = (id: string) => {
    selectSession(id);
    router.push(`/c/${id}`);
  };

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveRename = async (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      await renameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Hapus percakapan ini secara permanen?")) {
      const ok = await deleteSession(id);
      if (ok && currentSessionId === id) {
        router.push("/");
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out lg:static",
          isSidebarOpen ? "w-72 translate-x-0" : "-translate-x-full lg:w-0 lg:-translate-x-full overflow-hidden"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                UMKM Law AI
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  RAG
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Legal Navigator ID</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
            title="Tutup Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Percakapan Baru</span>
          </button>
        </div>

        {/* Session List Title */}
        <div className="px-4 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Riwayat Obrolan</span>
          <span className="text-[11px] font-normal text-slate-400">
            {sessions.length} Sesi
          </span>
        </div>

        {/* Sessions Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Belum ada riwayat percakapan. Mulai obrolan pertama Anda!
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isEditing = session.id === editingId;

              return (
                <div
                  key={session.id}
                  onClick={() => !isEditing && handleSelectSession(session.id)}
                  className={cn(
                    "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all",
                    isActive
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  )}
                >
                  <MessageSquare className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-400" : "text-slate-400")} />

                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveRename(session.id, e)}
                        className="w-full px-2 py-0.5 text-xs bg-slate-950 border border-blue-500 rounded text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={(e) => saveRename(session.id, e)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                        title="Simpan"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{session.title}</span>

                      {/* Action buttons on hover */}
                      <div className={cn("items-center gap-1 shrink-0", isActive ? "flex" : "hidden group-hover:flex")}>
                        <button
                          onClick={(e) => startRename(session.id, session.title, e)}
                          className="p-1 text-slate-400 hover:text-white rounded"
                          title="Ubah Judul"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(session.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Plan Badge & Admin Link */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* Pro Upgrade Teaser */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-slate-900 border border-blue-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Paket UMKM Pro</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mb-2">
              Buka kuota tanpa batas & fitur cetak draft perizinan resmi.
            </p>
            <button
              onClick={() => alert("Fitur simulasi langganan akan aktif di Fase 7!")}
              className="w-full py-1.5 text-center text-[11px] font-semibold bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Upgrade (Rp 49rb/bln)
            </button>
          </div>

          {/* Admin Dashboard Navigation */}
          <a
            href="/admin"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Dasbor Admin</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>
    </>
  );
}
