"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore, CitationItem } from "@/lib/store/useChatStore";
import {
  Send,
  Sparkles,
  Menu,
  Scale,
  ShieldCheck,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  {
    icon: Scale,
    title: "Pajak UMKM 0,5%",
    desc: "Berapa batas omzet agar usaha mikro bebas dari pajak?",
    prompt: "Berapa batas omset tahunan usaha mikro agar mendapatkan fasilitas bebas pajak menurut PP No. 55 Tahun 2022?",
  },
  {
    icon: FileText,
    title: "Perizinan OSS-RBA & NIB",
    desc: "Syarat mendapatkan NIB tunggal untuk risiko rendah?",
    prompt: "Bagaimana mekanisme perizinan tunggal NIB untuk kegiatan usaha dengan tingkat risiko rendah menurut aturan OSS RBA?",
  },
  {
    icon: ShieldCheck,
    title: "Sertifikasi Halal Gratis",
    desc: "Apa syarat self-declare halal tanpa biaya (Rp 0)?",
    prompt: "Apa syarat bagi pelaku Usaha Mikro dan Kecil untuk mendapatkan sertifikasi halal gratis melalui pernyataan mandiri (self-declare)?",
  },
  {
    icon: BookOpen,
    title: "Kriteria Modal UMKM",
    desc: "Batasan modal usaha mikro dan kecil terbaru?",
    prompt: "Berdasarkan PP No. 7 Tahun 2021, berapa batas modal usaha dan hasil penjualan tahunan untuk kategori Usaha Mikro dan Usaha Kecil?",
  },
];

export default function ChatArea() {
  const router = useRouter();
  const {
    currentSessionId,
    sessions,
    messages,
    isLoadingMessages,
    isStreaming,
    toggleSidebar,
    addMessage,
    updateStreamingMessage,
    setIsStreaming,
    createNewSession,
    openAuditModal,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isStreaming) return;

    setInputMessage("");

    // 1. Ensure we have an active session, or create one automatically
    let activeId = currentSessionId;
    if (!activeId) {
      // Create title from first 5 words
      const autoTitle = text.split(" ").slice(0, 5).join(" ");
      const created = await createNewSession(autoTitle);
      if (!created) {
        alert("Gagal membuat sesi obrolan.");
        return;
      }
      activeId = created.id;
      // Change route quietly
      window.history.pushState(null, "", `/c/${activeId}`);
    }

    // 2. Append User Message
    const userMsgId = `user-${Date.now()}`;
    addMessage({
      id: userMsgId,
      sessionId: activeId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    });

    // 3. Append Assistant Placeholder
    const assistantMsgId = `assistant-${Date.now()}`;
    addMessage({
      id: assistantMsgId,
      sessionId: activeId,
      role: "assistant",
      content: "",
      citations: [],
      createdAt: new Date().toISOString(),
    });

    setIsStreaming(true);

    try {
      // Send to streaming RAG endpoint
      const response = await fetch(`/api/chat/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let citationsList: CitationItem[] = [];

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const rawChunk = decoder.decode(value, { stream: true });
            const lines = rawChunk.split("\n\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.replace("data: ", ""));
                  if (data.type === "citations") {
                    citationsList = data.citations;
                  } else if (data.type === "token") {
                    updateStreamingMessage(data.token, citationsList);
                  }
                } catch {
                  // Text chunk fallback
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      updateStreamingMessage(
        "\n\n*(Terjadi kendala saat menghubungkan ke mesin RAG. Pastikan koneksi internet dan API Key Anda aktif).* " +
          err.message
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Helper to render inline clickable citations [Ref 1], [Ref 2]
   */
  const renderMessageContent = (content: string, citations?: CitationItem[] | null) => {
    // Regex matches [Ref 1], [Ref 2], etc.
    const parts = content.split(/(\[Ref\s+\d+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[Ref\s+(\d+)\]/);
      if (match && citations && citations.length > 0) {
        const refIndex = parseInt(match[1], 10) - 1;
        const citation = citations[refIndex];

        if (citation) {
          return (
            <button
              key={index}
              onClick={() => openAuditModal(citation)}
              className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/80 rounded border border-blue-300 dark:border-blue-700/50 transition-colors shadow-xs align-baseline"
              title={`Klik untuk melihat teks asli ${citation.pasal}`}
            >
              <Scale className="w-3 h-3 shrink-0" />
              <span>{part}</span>
            </button>
          );
        }
      }

      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Buka/Tutup Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 max-w-[200px] sm:max-w-md truncate">
              {currentSession?.title || "Konsultasi Regulasi UMKM"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Strict RAG Active</span>
          </div>
        </div>
      </header>

      {/* Main Messages Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          /* Empty State / Welcome Hero */
          <div className="h-full flex flex-col justify-center items-center text-center py-8 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Scale className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Navigator Regulasi & Perizinan UMKM
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Tanyakan apa saja seputar izin OSS-RBA, NIB, pajak UMKM PP 55/2022, hingga sertifikasi halal. AI menjawab dengan rujukan pasal asli tanpa halusinasi.
              </p>
            </div>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left pt-2">
              {QUICK_PROMPTS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Conversation Messages */
          messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 sm:gap-4",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Scale className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-xs",
                    isUser
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none leading-relaxed"
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose dark:prose-invert prose-sm max-w-none space-y-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>

                      {/* Render Citations if available */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Sumber Hukum:
                          </span>
                          {msg.citations.map((c, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => openAuditModal(c)}
                              className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded border border-slate-200 dark:border-slate-700 transition-colors"
                            >
                              [Ref {cIdx + 1}] {c.pasal}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isStreaming && (
          <div className="flex gap-3 sm:gap-4 items-center text-xs text-slate-400 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span>AI sedang merangkum pasal hukum terverifikasi...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Bottom Sticky Input Bar */}
      <footer className="p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan syarat izin NIB, kategori omzet UMKM, pajak, atau sertifikasi halal..."
              rows={1}
              className="flex-1 max-h-36 resize-none px-4 py-3 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isStreaming}
              className="mr-2.5 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            Panduan hukum didukung verifikasi pasal resmi (*Strict RAG*). Selalu periksa nomor referensi hukum sebelum mengambil keputusan bisnis.
          </p>
        </div>
      </footer>
    </div>
  );
}
