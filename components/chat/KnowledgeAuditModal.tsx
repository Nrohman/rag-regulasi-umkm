"use client";

import React, { useState } from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Scale,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function KnowledgeAuditModal() {
  const { isAuditModalOpen, closeAuditModal, activeCitation } = useChatStore();
  const [copied, setCopied] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);

  if (!activeCitation) return null;

  const handleCopyLink = async () => {
    if (!activeCitation.source_url) return;
    try {
      await navigator.clipboard.writeText(activeCitation.source_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Gagal menyalin tautan:", e);
    }
  };

  let hostname = "Portal Resmi Pemerintah";
  try {
    if (activeCitation.source_url) {
      hostname = new URL(activeCitation.source_url).hostname;
    }
  } catch {}

  return (
    <Dialog open={isAuditModalOpen} onOpenChange={(open) => !open && closeAuditModal()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-5 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Scale className="w-4 h-4 shrink-0" />
            <span>Verifikasi Dokumen Resmi Pemerintah</span>
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 leading-snug">
            {activeCitation.title}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded-md font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {activeCitation.pasal}
            </span>
            <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Kategori: {activeCitation.category}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status: AKTIF / BERLAKU</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Content Body: Action Cards & Direct Link to Official Web */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Dokumen ini diverifikasi secara resmi melalui{" "}
              <strong>Jaringan Dokumentasi dan Informasi Hukum Nasional (JDIHN) / BPK RI</strong>.
              Anda dapat membuka laman resmi pemerintah untuk meninjau naskah salinan asli, melihat riwayat peraturan, atau mengunduh berkas PDF lengkap.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {activeCitation.source_url ? (
              <a
                href={activeCitation.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span>Buka Dokumen Resmi di Web Pemerintah</span>
                <ExternalLink className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            ) : null}

            {activeCitation.source_url ? (
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Tautan Resmi Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Tautan Sumber ({hostname})</span>
                  </>
                )}
              </button>
            ) : null}
          </div>

          {/* Collapsible Peek Text Snippet (Hidden by default to keep UI clean) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowSnippet(!showSnippet)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showSnippet && "rotate-180")} />
              <span>{showSnippet ? "Sembunyikan Cuplikan Acuan AI" : "Lihat Cuplikan Ringkas Acuan AI"}</span>
            </button>
            {showSnippet && (
              <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-h-36 overflow-y-auto leading-relaxed whitespace-pre-wrap select-text">
                {activeCitation.content_raw}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={closeAuditModal}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
