"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import KnowledgeAuditModal from "@/components/chat/KnowledgeAuditModal";
import { useChatStore } from "@/lib/store/useChatStore";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { selectSession, currentSessionId } = useChatStore();

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      selectSession(sessionId);
    }
  }, [sessionId, currentSessionId, selectSession]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased">
      <Sidebar />
      <ChatArea />
      <KnowledgeAuditModal />
    </div>
  );
}
