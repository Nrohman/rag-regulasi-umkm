"use client";

import React, { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import KnowledgeAuditModal from "@/components/chat/KnowledgeAuditModal";
import { useChatStore } from "@/lib/store/useChatStore";

export default function HomePage() {
  const { resetCurrentChat } = useChatStore();

  useEffect(() => {
    // Reset to new conversation state on home page
    resetCurrentChat();
  }, [resetCurrentChat]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased">
      <Sidebar />
      <ChatArea />
      <KnowledgeAuditModal />
    </div>
  );
}
