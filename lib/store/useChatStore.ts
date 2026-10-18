import { create } from "zustand";

export interface CitationItem {
  document_id: string;
  title: string;
  pasal: string;
  category: string;
  content_raw: string;
  source_url: string;
  score?: number;
}

export interface MessageItem {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  citations?: CitationItem[] | null;
  createdAt: string;
}

export interface SessionItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

interface ChatState {
  sessions: SessionItem[];
  currentSessionId: string | null;
  messages: MessageItem[];
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  isSidebarOpen: boolean;

  // Knowledge Audit Modal State
  activeCitation: CitationItem | null;
  isAuditModalOpen: boolean;

  // Actions
  fetchSessions: () => Promise<void>;
  createNewSession: (title?: string) => Promise<SessionItem | null>;
  selectSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, newTitle: string) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  addMessage: (message: MessageItem) => void;
  updateStreamingMessage: (chunk: string, citations?: CitationItem[]) => void;
  setIsStreaming: (streaming: boolean) => void;
  openAuditModal: (citation: CitationItem) => void;
  closeAuditModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  resetCurrentChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isLoadingSessions: false,
  isLoadingMessages: false,
  isStreaming: false,
  isSidebarOpen: true,

  activeCitation: null,
  isAuditModalOpen: false,

  fetchSessions: async () => {
    set({ isLoadingSessions: true });
    try {
      const res = await fetch("/api/sessions");
      if (!res.ok) throw new Error("Gagal mengambil daftar sesi");
      const data: SessionItem[] = await res.json();
      set({ sessions: data });
    } catch (error) {
      console.error("fetchSessions error:", error);
    } finally {
      set({ isLoadingSessions: false });
    }
  },

  createNewSession: async (title = "Percakapan Baru") => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Gagal membuat sesi baru");
      const newSession: SessionItem = await res.json();

      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSessionId: newSession.id,
        messages: [],
      }));

      return newSession;
    } catch (error) {
      console.error("createNewSession error:", error);
      return null;
    }
  },

  selectSession: async (sessionId: string) => {
    if (get().currentSessionId === sessionId) return;

    set({ currentSessionId: sessionId, isLoadingMessages: true, messages: [] });
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Gagal mengambil pesan sesi");
      const data = await res.json();
      set({ messages: data.messages || [] });
    } catch (error) {
      console.error("selectSession error:", error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  renameSession: async (sessionId: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Gagal mengubah nama sesi");
      const updated: SessionItem = await res.json();

      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, title: updated.title } : s)),
      }));
      return true;
    } catch (error) {
      console.error("renameSession error:", error);
      return false;
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus sesi");

      set((state) => {
        const remaining = state.sessions.filter((s) => s.id !== sessionId);
        const nextCurrentId = state.currentSessionId === sessionId ? null : state.currentSessionId;
        return {
          sessions: remaining,
          currentSessionId: nextCurrentId,
          messages: state.currentSessionId === sessionId ? [] : state.messages,
        };
      });
      return true;
    } catch (error) {
      console.error("deleteSession error:", error);
      return false;
    }
  },

  addMessage: (message: MessageItem) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateStreamingMessage: (chunk: string, citations?: CitationItem[]) => {
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        last.content += chunk;
        if (citations) {
          last.citations = citations;
        }
      }
      return { messages: msgs };
    });
  },

  setIsStreaming: (streaming: boolean) => {
    set({ isStreaming: streaming });
  },

  openAuditModal: (citation: CitationItem) => {
    set({ activeCitation: citation, isAuditModalOpen: true });
  },

  closeAuditModal: () => {
    set({ activeCitation: null, isAuditModalOpen: false });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open });
  },

  resetCurrentChat: () => {
    set({ currentSessionId: null, messages: [] });
  },
}));
